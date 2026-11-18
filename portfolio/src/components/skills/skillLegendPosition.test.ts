import { expect, it } from 'vitest'
import { skillLegendPosition } from './skillLegendPosition'

it('uses the free left gutter when the space above the radar is too short, without entering its labels or the right card', () => {
  const result = skillLegendPosition({
    viewport: { left: 16, top: 16, right: 1780, bottom: 960 },
    column: { left: 310, right: 1000, top: 254, bottom: 900 },
    radar: { left: 425, right: 910, top: 310, bottom: 780 },
    headingBottom: 222, desiredHeight: 600,
  })
  expect(result.left + result.width).toBeLessThanOrEqual(413)
  expect(result.top).toBeLessThan(310)
  expect(result.top + result.maxHeight).toBeLessThanOrEqual(960)
  expect(result.width).toBe(340)
})

it('prefers the upper-left free band if it can display a readable panel above the whole radar', () => {
  const result = skillLegendPosition({
    viewport: { left: 16, top: 16, right: 1350, bottom: 752 },
    column: { left: 100, right: 700, top: 120, bottom: 700 },
    radar: { left: 180, right: 650, top: 440, bottom: 680 },
    headingBottom: 160, desiredHeight: 600,
  })
  expect(result.left).toBe(100)
  expect(result.top).toBeGreaterThan(160)
  expect(result.top + result.maxHeight).toBeLessThanOrEqual(428)
  expect(result.left + result.width).toBeLessThanOrEqual(700)
})

it('keeps a compact scrollable panel above the radar on narrow and short viewports', () => {
  for (const width of [320, 390]) {
    const result = skillLegendPosition({
      viewport: { left: 16, top: 16, right: width - 16, bottom: 700 },
      column: { left: 26, right: width - 26, top: 200, bottom: 690 },
      radar: { left: 30, right: width - 30, top: 310, bottom: 640 },
      headingBottom: 210, desiredHeight: 600,
    })
    expect(result.left).toBeGreaterThanOrEqual(16)
    expect(result.left + result.width).toBeLessThanOrEqual(width - 16)
    expect(result.top + result.maxHeight).toBeLessThanOrEqual(298)
    expect(result.maxHeight).toBeGreaterThan(60)
  }
})
