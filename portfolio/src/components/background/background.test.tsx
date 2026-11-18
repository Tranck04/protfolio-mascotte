import { act, StrictMode, createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import { backgroundLayout, backgroundPath, backgroundShapes, interpolateBackground, sceneBackgrounds } from './backgroundShapes'
import { createBackgroundController } from './backgroundAnimations'
import type { BackgroundController } from './backgroundAnimations'
import { MorphingBackground } from './MorphingBackground'

const cleanup: Array<() => void | Promise<void>> = []
afterEach(async () => { for (const dispose of cleanup.splice(0)) await dispose(); vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = '' })

it('defines five distinct closed compatible contours, sharing circle between Intro and Hero', () => {
  expect(sceneBackgrounds.intro).toBe(sceneBackgrounds.hero)
  const paths = Object.values(backgroundShapes).map(backgroundPath)
  expect(new Set(paths).size).toBe(5)
  for (const path of paths) {
    expect(path).toMatch(/^M.*Z$/)
    expect(path.match(/C/g)).toHaveLength(48)
    expect(path).not.toMatch(/NaN|Infinity/)
  }
  expect(backgroundShapes.circle.every(point => Math.abs(Math.hypot(point.x, point.y) - 90) < 1e-8)).toBe(true)
})

it('keeps every direct and reverse intermediate contour bounded and consistently wound', () => {
  for (const from of Object.values(backgroundShapes)) for (const to of Object.values(backgroundShapes)) {
    expect(interpolateBackground(from, to, 0)).toEqual(from)
    expect(interpolateBackground(from, to, 1)).toEqual(to)
    for (const t of [.1, .35, .5, .8]) {
      const points = interpolateBackground(from, to, t)
      for (let i = 0; i < points.length; i++) {
        const next = points[(i + 1) % points.length], point = points[i]
        expect(Math.hypot(point.x, point.y)).toBeGreaterThan(45)
        expect(Math.hypot(point.x, point.y)).toBeLessThan(125)
        // Each consecutive ray has positive angular advance: no folded or reversed landmarks.
        expect(point.x * next.y - point.y * next.x).toBeGreaterThan(0)
      }
    }
  }
})

function setup() {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  const controller = createBackgroundController(path)
  const timeline = gsap.timeline({ paused: true })
  cleanup.push(() => { controller.dispose(); timeline.kill() })
  return { path, controller, timeline }
}

it('changes the actual path between 10% and 85% of the owning timeline with no crossfade', () => {
  const { path, controller, timeline } = setup()
  controller.appendTo(timeline, 'skills', 1.1)
  timeline.seek(.1, false)
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.circle))
  timeline.seek(.55, false)
  const middle = path.getAttribute('d')
  expect(middle).not.toBe(backgroundPath(backgroundShapes.circle))
  expect(middle).not.toBe(backgroundPath(backgroundShapes.hexagon))
  timeline.seek(.94, false)
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.hexagon))
  expect(path.hasAttribute('opacity')).toBe(false)
})

it('starts an interrupted reverse morph from the current contour and prevents stale writes after settling', () => {
  const { path, controller, timeline } = setup()
  controller.appendTo(timeline, 'contact', 1.1)
  timeline.seek(.5, false)
  const middle = path.getAttribute('d')
  const reverse = gsap.timeline({ paused: true })
  cleanup.push(() => { reverse.kill() })
  controller.appendTo(reverse, 'projects', 1.1)
  reverse.seek(.1, false)
  expect(path.getAttribute('d')).toBe(middle)
  reverse.seek(.6, false)
  expect(path.getAttribute('d')).not.toBe(middle)
  controller.settle('journey')
  reverse.progress(1); timeline.progress(1)
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.triangle))
  controller.dispose()
  controller.settle('hero')
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.triangle))
})

it('keeps the SVG and its path through rerenders and responds to actual viewport measurements', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  let bounds = new DOMRect(0, 0, 1440, 900)
  vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockImplementation(() => bounds)
  const host = document.createElement('div'); document.body.appendChild(host)
  const root = createRoot(host), ref = createRef<BackgroundController>()
  const resize = vi.spyOn(window, 'removeEventListener')
  cleanup.push(async () => { await act(() => root.unmount()); expect(resize).toHaveBeenCalledWith('resize', expect.any(Function)) })
  await act(() => root.render(<StrictMode><MorphingBackground ref={ref} /></StrictMode>))
  const svg = host.querySelector('svg')!, path = svg.querySelector('[data-background-contour]')!
  const main = svg.querySelector('.background-main')!
  expect(svg.getAttribute('aria-hidden')).toBe('true')
  expect(svg.getAttribute('focusable')).toBe('false')
  expect(svg.querySelectorAll('path')).toHaveLength(1)
  expect(svg.getAttribute('viewBox')).toBe('0 0 1440 900')
  const desktopTransform = main.getAttribute('transform')
  ref.current!.settle('contact')
  bounds = new DOMRect(0, 0, 390, 844)
  await act(() => { window.dispatchEvent(new Event('resize')); root.render(<StrictMode><MorphingBackground ref={ref} /></StrictMode>) })
  expect(host.querySelector('svg')).toBe(svg)
  expect(svg.querySelector('[data-background-contour]')).toBe(path)
  expect(svg.getAttribute('viewBox')).toBe('0 0 390 844')
  expect(main.getAttribute('transform')).not.toBe(desktopTransform)
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.cloud))
  expect(backgroundLayout(390, 844).halo.rx).toBeLessThan(backgroundLayout(1440, 900).halo.rx)
})
