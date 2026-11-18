import gsap from 'gsap'
import { DOCK_INSET } from './introTimeline'
import type { MascotController } from '../mascot/types'
import { contactDock, contactTravel } from './contactTravel'
import { sceneShape, SHAPE_MORPH_DURATION } from '../mascot/sceneShapes'
import type { BackgroundController } from '../components/background/backgroundAnimations'

export type ContentScene = 'hero' | 'projects' | 'journey' | 'skills' | 'contact'
export const CONTENT_SCENES: readonly ContentScene[] = ['hero', 'projects', 'journey', 'skills', 'contact']
export const SCENE_DURATION = 1.1
type Point = { x: number; y: number }
const mix = (a: number, b: number, t: number) => a + (b - a) * t
export function quadraticPoint(start: Point, control: Point, end: Point, t: number): Point {
  return { x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t * t * end.x, y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t * t * end.y }
}

export function createSceneTransition({ stage, heroPanel, heroScroll, projectsPanel, journeyPanel, skillsPanel, contactPanel, contactAnchor, frame, home, mascotElement, mascot, background, reduced, onStart, onComplete }: {
  stage: HTMLElement; heroPanel: HTMLElement; heroScroll: HTMLElement; projectsPanel: HTMLElement; journeyPanel?: HTMLElement; skillsPanel?: HTMLElement; contactPanel?: HTMLElement; contactAnchor?: HTMLElement; frame: HTMLElement; home: HTMLElement;
  mascotElement: HTMLElement; mascot: MascotController; reduced: () => boolean;
  background?: BackgroundController;
  onStart: (scene: ContentScene) => void; onComplete: (scene: ContentScene) => void;
}) {
  let current: ContentScene = 'hero'
  let destination: ContentScene = 'hero'
  let busy = false
  let disposed = false
  let timeline: gsap.core.Timeline | null = null
  let watchdog: ReturnType<typeof setTimeout> | undefined
  const height = () => stage.clientHeight || window.innerHeight
  const panels = [heroPanel, projectsPanel, journeyPanel, skillsPanel, contactPanel]
  const panelY = (index: number, scene: ContentScene) => (index - CONTENT_SCENES.indexOf(scene)) * height()
  const placePanels = (scene: ContentScene) => panels.forEach((panel, index) => { if (panel) gsap.set(panel, { y: panelY(index, scene) }) })
  const contactTarget = () => {
    if (!contactPanel || !contactAnchor) return
    const bounds = stage.getBoundingClientRect()
    return contactDock({ left: bounds.left, top: bounds.top, width: stage.clientWidth, height: height() }, contactAnchor.getBoundingClientRect(), Number(gsap.getProperty(contactPanel, 'y')) || 0, Math.max(1, mascotElement.offsetWidth * 100 / 220))
  }
  const geometry = () => {
    const bounds = stage.getBoundingClientRect()
    const photo = frame.getBoundingClientRect()
    const slot = home.getBoundingClientRect()
    const heroY = Number(gsap.getProperty(heroPanel, 'y')) || 0
    const radius = Math.max(1, mascotElement.offsetWidth * 100 / 220)
    const dock = { x: photo.right - bounds.left - radius * DOCK_INSET, y: photo.top - bounds.top - heroY - radius * DOCK_INSET }
    const target = { x: slot.left + slot.width / 2 - bounds.left, y: slot.top + slot.height / 2 - bounds.top }
    const rightExit = photo.right - bounds.left + radius * 1.1
    const escapeX = rightExit + radius < stage.clientWidth - 4 ? rightExit : Math.max(radius + 4, photo.left - bounds.left - radius * 1.1)
    const escape = { x: escapeX, y: Math.max(radius + 5, dock.y - radius * .7) }
    const control = { x: mix(escape.x, target.x, .55) - radius * .55, y: mix(escape.y, target.y, .35) }
    const navScale = Math.max(.1, Math.min(slot.width, slot.height) * .82 / (radius * 2))
    return { dock, target, escape, control, navScale }
  }
  function anchor(scene: ContentScene) {
    const { dock, target, navScale } = geometry()
    Object.assign(mascot.pose, scene === 'contact' ? contactTarget() ?? { ...target, scale: navScale } : scene === 'hero' ? { ...dock, scale: 1 } : { ...target, scale: navScale })
    Object.assign(mascot.pose, { rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 })
    mascotElement.style.zIndex = scene === 'hero' ? '2' : '12'
    mascot.render(mascot.time)
  }
  /** The destination always owns the final shape, even after an interrupted or reduced-motion transition. */
  function applyShape(scene: ContentScene) {
    const target = sceneShape(scene)
    // Reduced motion and interrupted flights must show the final silhouette immediately.
    mascot.setShape(target, reduced() ? mascot.time - SHAPE_MORPH_DURATION - 0.05 : mascot.time)
  }
  function settle() {
    if (disposed) return
    const wasBusy = busy
    busy = false
    clearTimeout(watchdog)
    const previous = timeline
    timeline = null
    current = destination
    try {
      previous?.kill()
      placePanels(current)
      applyShape(current)
      anchor(current)
    } catch {
      // Keep content and navigation accessible even if the animation adapter fails.
      panels.forEach((panel, index) => { if (panel) panel.style.transform = `translateY(${panelY(index, current)}px)` })
      try { anchor(current) } catch { /* A rendering failure must not retain the scene lock. */ }
    } finally {
      // Decoration must never retain the navigation lock, even if its renderer fails.
      try { background?.settle(current) } catch { /* Content remains independently usable. */ }
      if (wasBusy) onComplete(current)
    }
  }
  placePanels('hero')
  mascotElement.style.zIndex = '2'
  return {
    get busy() { return busy },
    get current() { return current },
    get timeline() { return timeline },
    go(scene: ContentScene) {
      if (disposed || busy || scene === current || !panels[CONTENT_SCENES.indexOf(scene)] || scene === 'contact' && !contactAnchor) return false
      const involvesHero = current === 'hero' || scene === 'hero'
      const involvesContact = current === 'contact' || scene === 'contact'
      destination = scene
      busy = true
      // Hero has no user-selected state to retain; bring its portrait into view for the return.
      if (scene === 'hero') heroScroll.scrollTop = 0
      try {
        const { dock, target, escape, control, navScale } = geometry()
        const source = { x: mascot.pose.x, y: mascot.pose.y, scale: mascot.pose.scale }
        const contact = contactTarget()
        const heroEndpoint = scene === 'contact' && contact ? contact : current === 'contact' ? source : { ...target, scale: navScale }
        const flightControl = involvesContact ? { x: mix(escape.x, heroEndpoint.x, .55), y: mix(escape.y, heroEndpoint.y, .35) } : control
        onStart(scene)
        mascot.lookAway()
        // Contact always lands with a uniform scale; never inherit a transient squash.
        if (involvesContact) Object.assign(mascot.pose, { scaleX: 1, scaleY: 1 })
        if (scene === 'contact') mascot.express('idle', mascot.time)
        if (reduced()) { settle(); return true }
        const progress = { t: 0 }
        const travelEase = gsap.parseEase('power2.inOut')
        const exitEase = gsap.parseEase('power1.out')
        const renderFlight = () => {
          const t = scene !== 'hero' ? progress.t : 1 - progress.t
          let point: Point
          let scale = 1
          if (t < .22) {
            const u = exitEase(t / .22)
            const origin = scene !== 'hero' ? source : dock
            point = { x: mix(origin.x, escape.x, u), y: mix(origin.y, escape.y, u) }
            // Raise the persistent SVG only after it has cleared the opaque portrait.
            mascotElement.style.zIndex = '2'
          } else {
            const u = travelEase((t - .22) / .78)
            point = quadraticPoint(escape, flightControl, heroEndpoint, u)
            scale = mix(1, heroEndpoint.scale, u)
            mascotElement.style.zIndex = '12'
          }
          Object.assign(mascot.pose, { ...point, scale, rotation: 0, opacity: 1 })
          mascot.render(mascot.time)
        }
        timeline = gsap.timeline({ onComplete: settle, onInterrupt: () => { if (busy && !disposed) settle() } })
        panels.forEach((panel, index) => { if (panel) timeline!.to(panel, { y: panelY(index, scene), duration: SCENE_DURATION, ease: 'power3.inOut' }, 0) })
        try { background?.appendTo(timeline, scene, SCENE_DURATION) } catch { /* Keep existing scene and mascot motion available. */ }
        // Bloub keeps its spot between Projets, Parcours and Compétences: morph during the final slide.
        if (!involvesHero && !involvesContact) {
          const target = sceneShape(scene)
          timeline!.call(() => mascot.setShape(target, mascot.time), [], Math.max(0, SCENE_DURATION - SHAPE_MORPH_DURATION))
        }
        if (involvesHero) timeline.to(progress, { t: 1, duration: SCENE_DURATION, ease: 'none', onUpdate: renderFlight }, 0)
        else if (involvesContact) {
          const end = scene === 'contact' && contact ? contact : { ...target, scale: navScale }
          timeline.to(progress, { t: 1, duration: SCENE_DURATION, ease: 'power2.inOut', onUpdate() {
            Object.assign(mascot.pose, contactTravel(source, end, progress.t, Math.max(1, mascotElement.offsetWidth * 100 / 220), { width: stage.clientWidth, height: height() }), { opacity: 1, rotation: 0, scaleX: 1, scaleY: 1 })
            mascotElement.style.zIndex = '12'; mascot.render(mascot.time)
          } }, 0)
        }
        // An independent guard releases interactions even if a GSAP callback is interrupted.
        watchdog = setTimeout(settle, SCENE_DURATION * 1000 + 500)
      } catch (error) {
        console.error('Transition interrompue ; affichage de la scène demandée.', error)
        settle()
      }
      return true
    },
    settle,
    resize() { if (busy) settle(); else { destination = current; settle() } },
    updateHeroAnchor() { if (!busy && current === 'hero') anchor('hero') },
    updateContactAnchor() { if (!busy && current === 'contact') anchor('contact') },
    dispose() { disposed = true; busy = false; clearTimeout(watchdog); timeline?.kill(); timeline = null },
  }
}



