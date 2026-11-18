import gsap from 'gsap'
import type { MascotController } from '../mascot/types'

export const INTRO_TIMING = { pop: 0.2, morph: 0.95, roll: 1.7, stop: 3.8, wink: 4.1, rest: 4.95, exit: 5.6, settled: 7.3 } as const
export const rollingDegrees = (distance: number, radius: number) => distance / radius * 180 / Math.PI
export const DOCK_INSET = 0.35
const GREETING_WORDS = ['Hello', 'Hola', 'مرحبا', 'こんにちは', '你好'] as const
/** During the wink the greeting cycles through languages without extending the intro. */
const greetingWordAt = (time: number) => {
  if (time < INTRO_TIMING.wink) return 'Bonjour'
  const slot = Math.floor((time - INTRO_TIMING.wink) / 0.25)
  return slot < GREETING_WORDS.length ? GREETING_WORDS[slot] : 'Bonjour'
}
const clamp = (n: number) => Math.max(0, Math.min(1, n))

export function createIntroTimeline({ stage, hero, intro, greeting, frame, nav, mascot, reduced, onComplete }: {
  stage: HTMLElement; hero: HTMLElement; intro: HTMLElement; greeting: HTMLElement; frame: HTMLElement; nav: HTMLElement;
  mascot: MascotController; reduced: boolean; onComplete: () => void;
}) {
  let idleClock = INTRO_TIMING.settled as number
  let disposed = false
  let completed = false
  let lastTick = 0
  const tl = gsap.timeline({ paused: true })
  const local = (rect: DOMRect) => ({ left: rect.left - stage.getBoundingClientRect().left, top: rect.top - stage.getBoundingClientRect().top, right: rect.right - stage.getBoundingClientRect().left, bottom: rect.bottom - stage.getBoundingClientRect().top })
  gsap.set(hero, { x: 0, autoAlpha: 1 })
  const photo = local(frame.getBoundingClientRect())
  const text = local(greeting.getBoundingClientRect())
  const word = greeting.querySelector<HTMLElement>('.greeting-word')
  if (word) { word.style.width = ''; word.style.fontSize = '' }
  // The word must never occupy more room than the original "Bonjour".
  const baseWordWidth = word ? word.getBoundingClientRect().width : 0
  if (word && baseWordWidth > 0) {
    word.style.display = 'inline-block'
    word.style.width = `${baseWordWidth}px`
    word.style.textAlign = 'center'
  }
  const say = (value: string) => {
    if (!word || word.textContent === value) return
    word.textContent = value
    word.style.fontSize = ''
    if (baseWordWidth > 0 && word.scrollWidth > baseWordWidth + 1) {
      const base = parseFloat(getComputedStyle(word).fontSize) || 1
      word.style.fontSize = `${base * baseWordWidth / word.scrollWidth}px`
    }
  }
  const size = stage.querySelector<HTMLElement>('.mascot')!.offsetWidth
  const radius = size * 100 / 220
  const dock = { x: photo.right - radius * DOCK_INSET, y: photo.top - radius * DOCK_INSET }
  const endX = Math.max(radius + 18, text.left - radius - 18)
  const startX = Math.min(stage.clientWidth - radius - 22, text.right + radius + 28)
  const rollRotation = rollingDegrees(endX - startX, radius)
  // The circle first turns into its rolling orientation; it lands upright for the wink.
  const initialRotation = -(rollRotation - Math.round(rollRotation / 360) * 360)
  const stoppedRotation = initialRotation + rollRotation
  const pose = mascot.pose
  mascot.reset()
  Object.assign(pose, { x: startX, y: intro.clientHeight * 0.49, rotation: 0, scale: 0, scaleX: 1, scaleY: 1, opacity: 0 })
  const idleTick = (time: number) => {
    if (disposed || document.hidden) { lastTick = time; return }
    idleClock += lastTick ? Math.min(time - lastTick, 0.064) : 0
    lastTick = time
    mascot.render(idleClock)
  }
  function finish() {
    if (completed || disposed) return
    completed = true
    tl.pause()
    say('Bonjour')
    gsap.set(hero, { x: 0, autoAlpha: 1, clearProps: 'transform' })
    gsap.set(nav, { x: 0, autoAlpha: 1, clearProps: 'transform' })
    gsap.set(intro, { autoAlpha: 0 })
    // Settle the original engine, including when the introduction was skipped early.
    mascot.setShape('cercle', INTRO_TIMING.settled - 1)
    mascot.express('idle', INTRO_TIMING.settled - 1)
    Object.assign(pose, { ...dock, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 })
    mascot.render(INTRO_TIMING.settled)
    mascot.setIdle(!reduced)
    if (!reduced) gsap.ticker.add(idleTick)
    onComplete()
  }
  if (reduced) finish()
  else {
    gsap.set(hero, { x: stage.clientWidth * 1.05, autoAlpha: 0 })
    gsap.set(nav, { autoAlpha: 0 })
    gsap.set(intro, { autoAlpha: 1 })
    gsap.set(greeting, { opacity: 1, x: 0, clipPath: 'inset(0 0 0 100%)' })
    tl.to(pose, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.9)' }, INTRO_TIMING.pop)
      .to(pose, { scaleX: 1.12, scaleY: 0.9, duration: 0.16, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.65)
      .call(() => mascot.setShape('cercle', INTRO_TIMING.morph), [], INTRO_TIMING.morph)
      .to(pose, { rotation: initialRotation, duration: 0.55, ease: 'power2.inOut' }, 1.1)
      .to(pose, { x: endX, rotation: stoppedRotation, duration: INTRO_TIMING.stop - INTRO_TIMING.roll, ease: 'power2.inOut' }, INTRO_TIMING.roll)
      .call(() => mascot.express('wink', INTRO_TIMING.wink), [], INTRO_TIMING.wink)
      .call(() => mascot.express('idle', INTRO_TIMING.rest), [], INTRO_TIMING.rest)
      .addLabel('hero-arrival', INTRO_TIMING.exit)
      .set(hero, { autoAlpha: 1 }, 'hero-arrival')
      .to(hero, { x: 0, duration: 1.7, ease: 'power3.inOut' }, 'hero-arrival')
      .fromTo(nav, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.7, ease: 'power3.inOut' }, 'hero-arrival')
      .to(pose, { x: dock.x, rotation: stoppedRotation + rollingDegrees(dock.x - endX, radius), duration: 1.7, ease: 'power3.inOut' }, 'hero-arrival')
      .to(pose, { y: dock.y, duration: 1.1, ease: 'power2.inOut' }, INTRO_TIMING.exit + 0.6)
      .to(greeting, { opacity: 0, x: -50, duration: 0.65, ease: 'power2.in' }, 'hero-arrival')
      .to(intro, { autoAlpha: 0, duration: 0.35 }, INTRO_TIMING.exit + 0.35)
      .eventCallback('onUpdate', () => {
        // Reveal is a function of horizontal position, not an independent tween.
        if (tl.time() < INTRO_TIMING.roll) greeting.style.clipPath = 'inset(0 0 0 100%)'
        else if (tl.time() <= INTRO_TIMING.exit) {
          const hidden = clamp((pose.x - text.left) / (text.right - text.left))
          greeting.style.clipPath = `inset(0 0 0 ${hidden * 100}%)`
        }
        say(greetingWordAt(tl.time()))
        mascot.render(tl.time())
      })
      .eventCallback('onComplete', finish)
    mascot.render(0)
    tl.play(0)
  }
  return {
    finish,
    setReduced(value: boolean) {
      if (value) { finish(); gsap.ticker.remove(idleTick); mascot.setIdle(false) }
      else if (completed) { mascot.setIdle(true); lastTick = 0; gsap.ticker.add(idleTick) }
    },
    dispose() { disposed = true; tl.kill(); gsap.ticker.remove(idleTick) },
    timeline: tl,
  }
}
