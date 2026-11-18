// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import { createSceneTransition, SCENE_DURATION } from './sceneTransition'
import { createBloubController } from '../mascot/controller'
import { createBackgroundController } from '../components/background/backgroundAnimations'
import { backgroundPath, backgroundShapes } from '../components/background/backgroundShapes'

const cleanups: Array<() => void> = []
afterEach(() => { cleanups.splice(0).forEach(fn => fn()); document.body.innerHTML = ''; vi.restoreAllMocks() })

function setup(reduced = false, mobile = false) {
  document.body.innerHTML = '<main><div class="scroll"><section class="hero"><div class="frame"></div></section></div><section class="projects"></section><section class="journey"></section><section class="skills"></section><section class="contact"><div class="contact-anchor"></div></section><div class="mascot"><svg><path data-body/><path data-silhouette/><path data-eye/><path data-eye/></svg></div></main><button class="home"></button>'
  const stage = document.querySelector('main')!
  const backgroundElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  const background = createBackgroundController(backgroundElement)
  cleanups.push(background.dispose)
  const hero = stage.querySelector<HTMLElement>('.hero')!
  const scroll = stage.querySelector<HTMLElement>('.scroll')!
  const panel = stage.querySelector<HTMLElement>('.projects')!
  const journey = stage.querySelector<HTMLElement>('.journey')!
  const skills = stage.querySelector<HTMLElement>('.skills')!
  const contact = stage.querySelector<HTMLElement>('.contact')!
  const contactAnchor = stage.querySelector<HTMLElement>('.contact-anchor')!
  const frame = stage.querySelector<HTMLElement>('.frame')!
  const home = document.querySelector<HTMLElement>('.home')!
  const element = stage.querySelector<HTMLDivElement>('.mascot')!
  let slot = mobile ? new DOMRect(28, 740, 36, 36) : new DOMRect(1200, 220, 40, 40)
  let photo = new DOMRect(780, 150, 350, 450)
  let contactMarker = new DOMRect(180, 300, 144, 144)
  Object.defineProperty(stage, 'clientWidth', { value: mobile ? 390 : 1280 })
  Object.defineProperty(stage, 'clientHeight', { value: 800 })
  Object.defineProperty(element, 'offsetWidth', { value: 132 })
  stage.getBoundingClientRect = () => new DOMRect(0, 0, 1280, 800)
  home.getBoundingClientRect = () => slot
  frame.getBoundingClientRect = () => new DOMRect(photo.x, photo.y + Number(gsap.getProperty(hero, 'y')), photo.width, photo.height)
  contactAnchor.getBoundingClientRect = () => new DOMRect(contactMarker.x, contactMarker.y + Number(gsap.getProperty(contact, 'y')), contactMarker.width, contactMarker.height)
  const mascot = createBloubController(element, element.querySelector('svg')!)
  mascot.reset(); mascot.setShape('cercle', 0); mascot.render(8)
  Object.assign(mascot.pose, { x: 1109, y: 129, scale: 1, opacity: 1 })
  let completed = 0
  const motion = createSceneTransition({ stage, heroPanel: hero, heroScroll: scroll, projectsPanel: panel, journeyPanel: journey, skillsPanel: skills, contactPanel: contact, contactAnchor, frame, home, mascotElement: element, mascot, background, reduced: () => reduced, onStart() {}, onComplete() { completed++ } })
  cleanups.push(motion.dispose)
  return { motion, mascot, element, hero, panel, journey, skills, contact, scroll, backgroundElement, completed: () => completed, moveSlot: (rect: DOMRect) => { slot = rect }, movePhoto: (rect: DOMRect) => { photo = rect }, moveContact: (rect: DOMRect) => { contactMarker = rect } }
}

it('moves two contiguous scenes and the same visible mascot, then reverses to the photo', () => {
  const { motion, mascot, element, hero, panel } = setup()
  expect(motion.go('projects')).toBe(true)
  expect(motion.go('hero')).toBe(false)
  const timeline = motion.timeline!
  timeline.pause().seek(SCENE_DURATION / 2, false)
  expect(Number(gsap.getProperty(panel, 'y')) - Number(gsap.getProperty(hero, 'y'))).toBeCloseTo(800)
  expect(mascot.pose.opacity).toBe(1)
  expect(element.style.zIndex).toBe('12')
  expect(mascot.pose.scale).toBeLessThan(1)
  expect(mascot.pose.x).toBeGreaterThan(1109)
  timeline.progress(1)
  expect(motion.busy).toBe(false)
  expect(mascot.pose.x).toBeCloseTo(1220)
  expect(mascot.pose.y).toBeCloseTo(240)
  expect(mascot.pose.scale).toBeCloseTo(40 * .82 / 120)
  expect(motion.go('hero')).toBe(true)
  motion.timeline!.progress(1)
  expect(mascot.pose.x).toBeCloseTo(1130 - 60 * .35)
  expect(mascot.pose.y).toBeCloseTo(150 - 60 * .35)
  expect(mascot.pose.scale).toBe(1)
  expect(element.style.zIndex).toBe('2')
  expect(document.querySelectorAll('.mascot')).toHaveLength(1)
})

it('uses the actual compact navigation centre and reanchors after viewport changes', () => {
  const { motion, mascot, moveSlot, movePhoto } = setup(true, true)
  motion.go('projects')
  expect(mascot.pose.x).toBeCloseTo(46)
  expect(mascot.pose.y).toBeCloseTo(758)
  moveSlot(new DOMRect(90, 700, 36, 36))
  motion.resize()
  expect(mascot.pose.x).toBe(108)
  expect(mascot.pose.y).toBe(718)
  movePhoto(new DOMRect(200, 100, 140, 140))
  motion.go('hero')
  expect(mascot.pose.x).toBe(340 - 60 * .35)
  expect(mascot.pose.y).toBe(100 - 60 * .35)
})

it('releases the transition lock on interruption and resize without a second instance', () => {
  const { motion, completed } = setup()
  motion.go('projects')
  motion.timeline!.pause().seek(.35, false)
  motion.resize()
  expect(motion.busy).toBe(false)
  expect(motion.current).toBe('projects')
  expect(completed()).toBe(1)
  motion.go('hero')
  motion.timeline!.kill()
  expect(motion.busy).toBe(false)
  expect(completed()).toBe(2)
})

it('exposes the requested scene and releases its lock even if GSAP cannot apply the final styles', () => {
  const { motion, panel, completed } = setup(true)
  vi.spyOn(gsap, 'set').mockImplementationOnce(() => { throw new Error('Simulated style adapter failure') })
  motion.go('projects')
  expect(motion.busy).toBe(false)
  expect(motion.current).toBe('projects')
  expect(completed()).toBe(1)
  expect(panel.style.transform).toBe('translateY(0px)')
  expect(motion.go('hero')).toBe(true)
  expect(motion.current).toBe('hero')
})

it('slides Projects and Journey in both directions while Bloub stays exactly in the Home slot', () => {
  const { motion, panel, journey, mascot, element } = setup()
  motion.go('projects'); motion.timeline!.progress(1)
  const pose = { ...mascot.pose }
  const transform = element.style.transform
  motion.go('journey')
  motion.timeline!.pause().seek(SCENE_DURATION / 2, false)
  expect(Number(gsap.getProperty(journey, 'y')) - Number(gsap.getProperty(panel, 'y'))).toBeCloseTo(800)
  expect(Number(gsap.getProperty(panel, 'y'))).toBeLessThan(0)
  expect(Number(gsap.getProperty(journey, 'y'))).toBeGreaterThan(0)
  expect(mascot.pose).toEqual(pose)
  expect(element.style.transform).toBe(transform)
  motion.timeline!.progress(1)
  expect(motion.current).toBe('journey')
  motion.go('projects')
  motion.timeline!.pause().seek(SCENE_DURATION / 2, false)
  expect(Number(gsap.getProperty(journey, 'y')) - Number(gsap.getProperty(panel, 'y'))).toBeCloseTo(800)
  motion.timeline!.progress(1)
  expect(mascot.pose).toEqual(pose)
  expect(motion.busy).toBe(false)
})

it('handles direct Hero to Journey navigation, resize, and the original return flight', () => {
  const { motion, mascot, journey } = setup()
  motion.go('journey')
  motion.timeline!.pause().seek(.4, false)
  motion.resize()
  expect(motion.busy).toBe(false)
  expect(motion.current).toBe('journey')
  expect(Number(gsap.getProperty(journey, 'y'))).toBe(0)
  expect(mascot.pose.x).toBe(1220)
  motion.go('hero'); motion.timeline!.progress(1)
  expect(mascot.pose.scale).toBe(1)
  expect(mascot.pose.x).toBeCloseTo(1130 - 60 * .35)
})

it('keeps Journey and Skills contiguous in both directions without moving the docked mascot', () => {
  const { motion, journey, skills, mascot, element } = setup()
  motion.go('journey'); motion.timeline!.progress(1)
  const pose = { ...mascot.pose }
  const transform = element.style.transform
  motion.go('skills')
  motion.timeline!.pause().seek(SCENE_DURATION / 2, false)
  expect(Number(gsap.getProperty(skills, 'y')) - Number(gsap.getProperty(journey, 'y'))).toBeCloseTo(800)
  expect(mascot.pose).toEqual(pose)
  expect(element.style.transform).toBe(transform)
  motion.timeline!.progress(1)
  expect(motion.current).toBe('skills')
  motion.go('journey')
  motion.timeline!.pause().seek(.35, false)
  motion.resize()
  expect(motion.current).toBe('journey')
  expect(motion.busy).toBe(false)
  expect(mascot.pose).toEqual(pose)
})

it('moves the one visible mascot from the Home slot into Contact and back while scenes remain contiguous', () => {
  const { motion, mascot, skills, contact } = setup()
  motion.go('skills'); motion.timeline!.progress(1)
  const start = { ...mascot.pose }
  motion.go('contact')
  expect(mascot.pose).toEqual(start)
  motion.timeline!.pause().seek(SCENE_DURATION / 2, false)
  expect(Number(gsap.getProperty(contact, 'y')) - Number(gsap.getProperty(skills, 'y'))).toBeCloseTo(800)
  expect(mascot.pose.x).toBeGreaterThan(252)
  expect(mascot.pose.x).toBeLessThan(start.x)
  expect(mascot.pose.scale).toBeGreaterThan(start.scale)
  expect(mascot.pose.scale).toBeLessThan(1.2)
  expect(mascot.pose.opacity).toBe(1)
  motion.timeline!.progress(1)
  expect(mascot.pose).toMatchObject({ x: 252, y: 372, scale: 1.2, opacity: 1 })
  motion.go('skills')
  motion.timeline!.pause().seek(.5, false)
  expect(mascot.pose.opacity).toBe(1)
  motion.timeline!.progress(1)
  expect(mascot.pose).toEqual(start)
  expect(document.querySelectorAll('.mascot')).toHaveLength(1)
})
it('supports direct Contact access from Hero and the reverse occlusion path without a teleport', () => {
  const { motion, mascot, element } = setup()
  motion.go('contact'); motion.timeline!.progress(1)
  const source = { ...mascot.pose }
  motion.go('hero')
  expect(mascot.pose).toEqual(source)
  motion.timeline!.pause().seek(.2, false)
  expect(mascot.pose.opacity).toBe(1)
  expect(element.style.zIndex).toBe('12')
  motion.timeline!.progress(1)
  expect(mascot.pose).toMatchObject({ x: 1109, y: 129, scale: 1, opacity: 1 })
  expect(element.style.zIndex).toBe('2')
})
it('returns from Contact directly to Projects or Journey through the Home-slot anchor', () => {
  const { motion, mascot } = setup()
  for (const scene of ['projects', 'journey'] as const) {
    motion.go('contact'); motion.timeline!.progress(1)
    const source = { ...mascot.pose }
    motion.go(scene)
    expect(mascot.pose).toEqual(source)
    motion.timeline!.pause().seek(.5, false)
    expect(mascot.pose.opacity).toBe(1)
    motion.timeline!.progress(1)
    expect(mascot.pose.x).toBe(1220)
    expect(mascot.pose.y).toBe(240)
    expect(mascot.pose.scale).toBeCloseTo(40 * .82 / 120)
  }
})
it('reanchors Contact to the actual marker after resize and settles an interrupted flight safely', () => {
  const { motion, mascot, moveContact } = setup()
  motion.go('contact'); motion.timeline!.pause().seek(.3, false)
  motion.timeline!.kill()
  expect(motion.current).toBe('contact')
  expect(motion.busy).toBe(false)
  moveContact(new DOMRect(28, 30, 94, 94))
  motion.resize()
  expect(mascot.pose.x).toBe(75)
  expect(mascot.pose.y).toBe(77)
  expect(mascot.pose.scale).toBeCloseTo(94 / 120)
  motion.go('skills'); motion.timeline!.progress(1)
  expect(motion.busy).toBe(false)
})

it('shares the scene clock for direct and reverse background morphs and settles interrupted destinations', () => {
  const { motion, backgroundElement } = setup()
  const circle = backgroundPath(backgroundShapes.circle), hexagon = backgroundPath(backgroundShapes.hexagon)
  motion.go('skills')
  motion.timeline!.pause().seek(.05, false)
  expect(backgroundElement.getAttribute('d')).toBe(circle)
  motion.timeline!.seek(.55, false)
  expect(backgroundElement.getAttribute('d')).not.toBe(circle)
  expect(backgroundElement.getAttribute('d')).not.toBe(hexagon)
  motion.timeline!.progress(1)
  expect(backgroundElement.getAttribute('d')).toBe(hexagon)
  motion.go('journey'); motion.timeline!.pause().seek(.4, false)
  motion.timeline!.kill()
  expect(backgroundElement.getAttribute('d')).toBe(backgroundPath(backgroundShapes.triangle))
  expect(motion.current).toBe('journey')
  expect(motion.busy).toBe(false)
  motion.go('contact'); motion.timeline!.pause().seek(.5, false); motion.resize()
  expect(backgroundElement.getAttribute('d')).toBe(backgroundPath(backgroundShapes.cloud))
  motion.go('hero'); motion.timeline!.progress(1)
  expect(backgroundElement.getAttribute('d')).toBe(circle)
})

it('applies every destination without interpolation when motion is reduced', () => {
  const { motion, backgroundElement } = setup(true)
  for (const [scene, shape] of [['projects', 'squircle'], ['journey', 'triangle'], ['skills', 'hexagon'], ['contact', 'cloud'], ['hero', 'circle']] as const) {
    motion.go(scene)
    expect(backgroundElement.getAttribute('d')).toBe(backgroundPath(backgroundShapes[shape]))
    expect(motion.busy).toBe(false)
    expect(motion.timeline).toBeNull()
  }
})
