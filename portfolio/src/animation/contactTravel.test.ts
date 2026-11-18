import { expect, it } from 'vitest'
import { contactDock, contactTravel } from './contactTravel'

it('uses the real marker after removing the scene translation, including on compact viewports', () => {
  expect(contactDock({ left: 0, top: 0, width: 1280, height: 800 }, { left: 180, top: 1840, width: 144, height: 144 }, 1600, 60)).toEqual({ x: 252, y: 312, scale: 1.2 })
  const mobile = contactDock({ left: 0, top: 0, width: 390, height: 780 }, { left: 28, top: 30, width: 94, height: 94 }, 0, 35)
  expect(mobile.x).toBe(75)
  expect(mobile.y).toBe(77)
  expect(mobile.scale).toBeCloseTo(94 / 70)
})
it('keeps both endpoints exact and changes position and scale continuously in either direction', () => {
  const from = { x: 1220, y: 240, scale: .27 }
  const to = { x: 250, y: 360, scale: 1.2 }
  const viewport = { width: 1280, height: 800 }
  expect(contactTravel(from, to, 0, 60, viewport)).toEqual(from)
  expect(contactTravel(from, to, 1, 60, viewport)).toEqual(to)
  let previous = from
  for (let i = 1; i <= 100; i++) {
    const pose = contactTravel(from, to, i / 100, 60, viewport)
    expect(Math.hypot(pose.x - previous.x, pose.y - previous.y)).toBeLessThan(30)
    expect(pose.scale).toBeGreaterThanOrEqual(previous.scale)
    expect(pose.x).toBeGreaterThan(0); expect(pose.y).toBeGreaterThan(0)
    previous = pose
  }
  expect(contactTravel(to, from, 1, 60, viewport)).toEqual(from)
})
