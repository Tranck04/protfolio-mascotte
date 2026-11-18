// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import gsap from 'gsap'
import { createIntroTimeline, INTRO_TIMING, rollingDegrees } from './introTimeline'
import { createBloubController } from '../mascot/controller'

const cleanups: Array<() => void> = []
afterEach(() => { cleanups.splice(0).forEach(fn => fn()); document.body.innerHTML = '' })

function setup(reduced = false) {
  document.body.innerHTML = `<main><div class="introduction"><div class="greeting"><span><span class="greeting-word">Bonjour</span><span class="greeting-period">.</span></span></div></div><div class="mascot"><svg><path data-body/><path data-silhouette/><path data-eye/><path data-eye/></svg></div><section><div class="frame"/></section><nav class="floating-nav"/></main>`
  const stage = document.querySelector('main')!
  const intro = stage.querySelector<HTMLElement>('.introduction')!
  const greeting = stage.querySelector<HTMLElement>('.greeting')!
  const hero = stage.querySelector('section')!
  const frame = stage.querySelector<HTMLElement>('.frame')!
  const root = stage.querySelector<HTMLElement>('.mascot') as HTMLDivElement
  stage.getBoundingClientRect = () => new DOMRect(0, 0, 1280, 800)
  frame.getBoundingClientRect = () => new DOMRect(780, 150, 350, 450)
  greeting.getBoundingClientRect = () => new DOMRect(350, 280, 580, 200)
  Object.defineProperty(stage, 'clientWidth', { value: 1280 })
  Object.defineProperty(intro, 'clientHeight', { value: 800 })
  Object.defineProperty(root, 'offsetWidth', { value: 132 })
  const nav = stage.querySelector<HTMLElement>('.floating-nav')!
  const mascot = createBloubController(root, root.querySelector('svg')!)
  let finished = 0
  const animation = createIntroTimeline({ stage, hero, intro, greeting, frame, nav, mascot, reduced, onComplete: () => finished++ })
  animation.timeline.pause()
  cleanups.push(animation.dispose)
  return { animation, mascot, greeting, hero, intro, root, finished: () => finished }
}

describe('portfolio choreography with the real Bloub engine', () => {
  it('morphs cloud to circle and keeps rolling angle proportional to displacement', () => {
    const { animation, mascot, root } = setup()
    animation.timeline.seek(0.8, false)
    const cloud = root.querySelector('[data-body]')!.getAttribute('d')
    animation.timeline.seek(INTRO_TIMING.roll, false)
    const circle = root.querySelector('[data-body]')!.getAttribute('d')
    expect(circle).not.toBe(cloud)
    const start = { ...mascot.pose }
    animation.timeline.seek(2.5, false)
    expect(mascot.pose.rotation - start.rotation).toBeCloseTo(rollingDegrees(mascot.pose.x - start.x, 60), 3)
  })
  it('reveals the greeting using the actual horizontal position and plays wink', () => {
    const { animation, mascot, greeting, root } = setup()
    animation.timeline.seek(2.7, false)
    const percent = Math.max(0, Math.min(1, (mascot.pose.x - 350) / 580)) * 100
    expect(greeting.style.clipPath).toBe(`inset(0 0 0 ${percent}%)`)
    animation.timeline.seek(INTRO_TIMING.stop, false)
    expect(greeting.style.clipPath).toBe('inset(0 0 0 0%)')
    animation.timeline.seek(4.6, false)
    const eyes = [...root.querySelectorAll('[data-eye]')].map(e => e.getAttribute('d'))
    expect(eyes[0]).not.toBe(eyes[1])
  })
  it('cycles the greeting through languages during the wink and returns to Bonjour before the erase', () => {
    const { animation, greeting } = setup()
    const word = greeting.querySelector<HTMLElement>('.greeting-word')!
    animation.timeline.seek(INTRO_TIMING.wink, false)
    expect(word.textContent).toBe('Hello')
    animation.timeline.seek(INTRO_TIMING.wink + 0.3, false)
    expect(word.textContent).toBe('Hola')
    animation.timeline.seek(INTRO_TIMING.wink + 0.55, false)
    expect(word.textContent).toBe('مرحبا')
    animation.timeline.seek(INTRO_TIMING.wink + 0.8, false)
    expect(word.textContent).toBe('こんにちは')
    animation.timeline.seek(INTRO_TIMING.wink + 1.05, false)
    expect(word.textContent).toBe('你好')
    animation.timeline.seek(INTRO_TIMING.exit - 0.1, false)
    expect(word.textContent).toBe('Bonjour')
  })
  it('moves hero and mascot on the same timeline, then settles at the top-right of the frame', () => {
    const { animation, mascot, hero, finished } = setup()
    animation.timeline.seek(INTRO_TIMING.exit, false)
    const startX = mascot.pose.x
    animation.timeline.seek(6.4, false)
    expect(mascot.pose.x).toBeGreaterThan(startX)
    expect(Number(gsap.getProperty(hero, 'x'))).toBeGreaterThan(0)
    animation.finish()
    expect(mascot.pose.x).toBeCloseTo(1130 - 60 * 0.35)
    expect(mascot.pose.y).toBeCloseTo(150 - 60 * 0.35)
    expect(finished()).toBe(1)
    animation.finish()
    expect(finished()).toBe(1)
  })
  it('skips all movement for reduced motion and exposes a stable Hero', () => {
    const { animation, mascot, intro, hero, finished } = setup(true)
    expect(animation.timeline.duration()).toBe(0)
    expect(finished()).toBe(1)
    expect(hero.style.visibility).toBe('inherit')
    expect(intro.style.visibility).toBe('hidden')
    expect(mascot.pose.scale).toBe(1)
  })
})
