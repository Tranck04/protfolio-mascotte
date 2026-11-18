// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import { adjacentScene, bindSceneGestures } from './sceneGestures'
import type { ContentScene } from './sceneTransition'

const cleanups: Array<() => void> = []
afterEach(() => { cleanups.splice(0).forEach(fn => fn()); document.body.innerHTML = ''; vi.restoreAllMocks() })
function setup() {
  document.body.innerHTML = '<main><div data-scene-scroll><h2 tabindex="-1">Scene</h2></div></main>'
  const element = document.querySelector('main')!
  const scroller = document.querySelector<HTMLElement>('[data-scene-scroll]')!
  let current: ContentScene = 'hero'
  let locked = false
  let main = true
  const navigate = vi.fn((scene: ContentScene) => { current = scene; return true })
  cleanups.push(bindSceneGestures({ element, current: () => current, locked: () => locked, projectsMain: () => main, navigate }))
  return { element, scroller, navigate, lock: (value: boolean) => { locked = value }, main: (value: boolean) => { main = value }, wheel: (delta: number) => scroller.dispatchEvent(new WheelEvent('wheel', { deltaY: delta, bubbles: true, cancelable: true })) }
}

it('claims at most one scene per wheel burst, including momentum and direction bounce', () => {
  let time = 0
  vi.spyOn(performance, 'now').mockImplementation(() => time)
  const { wheel, navigate } = setup()
  wheel(12); wheel(16); wheel(16)
  expect(navigate).toHaveBeenCalledExactlyOnceWith('projects')
  time = 100; wheel(-120); wheel(-120)
  expect(navigate).toHaveBeenCalledTimes(1)
  time = 500; wheel(-120)
  expect(navigate).toHaveBeenLastCalledWith('hero')
  expect(navigate).toHaveBeenCalledTimes(2)
})

it('leaves internal scrolling and secondary/detail galleries in charge of their scroll', () => {
  const { scroller, wheel, navigate, main } = setup()
  Object.defineProperty(scroller, 'scrollHeight', { configurable: true, value: 1400 })
  Object.defineProperty(scroller, 'clientHeight', { configurable: true, value: 700 })
  wheel(120)
  expect(navigate).not.toHaveBeenCalled()
  scroller.scrollTop = 700
  wheel(120)
  expect(navigate).toHaveBeenCalledWith('projects')
  main(false); scroller.scrollTop = 0
  wheel(-120)
  expect(navigate).toHaveBeenCalledTimes(1)
})

it('ignores held keys and keeps scene changes unavailable while an animation owns the lock', () => {
  const { element, navigate, lock } = setup()
  lock(true)
  element.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
  expect(navigate).not.toHaveBeenCalled()
  lock(false)
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', repeat: true, bubbles: true }))
  expect(navigate).not.toHaveBeenCalled()
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }))
  expect(navigate).toHaveBeenCalledWith('projects')
})

it('accepts a vertical swipe at an edge but leaves horizontal and internal-scroll swipes alone', () => {
  const { scroller, navigate } = setup()
  const touch = (type: string, x: number, y: number) => {
    const event = new Event(type, { bubbles: true, cancelable: true })
    const points = [{ clientX: x, clientY: y }]
    Object.defineProperties(event, { touches: { value: type === 'touchend' ? [] : points }, changedTouches: { value: points } })
    scroller.dispatchEvent(event)
    return event
  }
  touch('touchstart', 100, 500)
  expect(touch('touchmove', 105, 350).defaultPrevented).toBe(true)
  touch('touchend', 105, 350)
  expect(navigate).toHaveBeenCalledExactlyOnceWith('projects')
  touch('touchstart', 100, 300)
  touch('touchend', 300, 380)
  expect(navigate).toHaveBeenCalledTimes(1)
  Object.defineProperty(scroller, 'scrollHeight', { value: 1400 })
  Object.defineProperty(scroller, 'clientHeight', { value: 700 })
  scroller.scrollTop = 300
  touch('touchstart', 100, 300)
  touch('touchend', 100, 480)
  expect(navigate).toHaveBeenCalledTimes(1)
})

it('uses only implemented neighbours and gives Journey internal scrolling priority', () => {
  expect(adjacentScene('projects', 1)).toBe('journey')
  expect(adjacentScene('journey', -1)).toBe('projects')
  expect(adjacentScene('journey', 1)).toBe('skills')
  expect(adjacentScene('skills', -1)).toBe('journey')
  expect(adjacentScene('skills', 1)).toBe('contact')
  expect(adjacentScene('contact', -1)).toBe('skills')
  expect(adjacentScene('contact', 1)).toBeUndefined()
  let time = 0
  vi.spyOn(performance, 'now').mockImplementation(() => time)
  const { scroller, wheel, navigate } = setup()
  wheel(120)
  time = 400; wheel(120)
  expect(navigate).toHaveBeenLastCalledWith('journey')
  Object.defineProperty(scroller, 'scrollHeight', { value: 1400 })
  Object.defineProperty(scroller, 'clientHeight', { value: 700 })
  scroller.scrollTop = 200
  time = 800; wheel(-120)
  expect(navigate).toHaveBeenCalledTimes(2)
  scroller.scrollTop = 0
  time = 1200; wheel(-120)
  expect(navigate).toHaveBeenLastCalledWith('projects')
})

it('lets all nested scroll containers reach their edge before changing scenes', () => {
  const { scroller, navigate } = setup()
  Object.defineProperty(scroller, 'scrollHeight', { value: 1400 })
  Object.defineProperty(scroller, 'clientHeight', { value: 700 })
  const inner = document.createElement('aside')
  inner.dataset.sceneScroll = ''
  scroller.appendChild(inner)
  Object.defineProperty(inner, 'scrollHeight', { value: 800 })
  Object.defineProperty(inner, 'clientHeight', { value: 400 })
  inner.scrollTop = 400
  inner.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
  expect(navigate).not.toHaveBeenCalled()
  scroller.scrollTop = 700
  inner.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
  expect(navigate).toHaveBeenCalledWith('projects')
  const legend = document.createElement('div')
  legend.dataset.sceneGestureIgnore = ''
  scroller.appendChild(legend)
  legend.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true }))
  expect(navigate).toHaveBeenCalledTimes(1)
})

it('never claims an event originating inside a data-scroll-region, even at its limits', () => {
  const { scroller, navigate } = setup()
  const region = document.createElement('aside')
  region.dataset.scrollRegion = ''
  scroller.appendChild(region)
  Object.defineProperty(region, 'scrollHeight', { configurable: true, value: 800 })
  Object.defineProperty(region, 'clientHeight', { configurable: true, value: 400 })
  region.scrollTop = 400
  region.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
  expect(navigate).not.toHaveBeenCalled()
  region.scrollTop = 0
  region.dispatchEvent(new WheelEvent('wheel', { deltaY: -120, bubbles: true, cancelable: true }))
  expect(navigate).not.toHaveBeenCalled()
})
