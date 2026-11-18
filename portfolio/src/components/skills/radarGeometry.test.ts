import { expect, it } from 'vitest'
import { polygonPoints, RADAR, radarPoint, radarRing, radarValues } from './radarGeometry'

it('places five equally spaced axes with Frontend at the top', () => {
  const axes = Array.from({ length: 5 }, (_, index) => radarPoint(index, 5, RADAR.radius))
  expect(axes[0].x).toBeCloseTo(RADAR.cx)
  expect(axes[0].y).toBeCloseTo(RADAR.cy - RADAR.radius)
  const angles = axes.map(point => Math.atan2(point.y - RADAR.cy, point.x - RADAR.cx))
  for (let i = 0; i < 4; i++) expect((angles[i + 1] - angles[i] + Math.PI * 2) % (Math.PI * 2)).toBeCloseTo(2 * Math.PI / 5)
})

it('encodes levels as radial distances rather than percentages or irregular scales', () => {
  const levels = [4, 3, 2, 3, 3]
  const points = radarValues(levels)
  points.forEach((point, i) => expect(Math.hypot(point.x - RADAR.cx, point.y - RADAR.cy)).toBeCloseTo(RADAR.radius * levels[i] / 5))
  expect(radarRing(5).split(' ')).toHaveLength(5)
  expect(radarValues([0, 0, 0, 0, 0]).every(point => point.x === RADAR.cx && point.y === RADAR.cy)).toBe(true)
  expect(polygonPoints(points)).not.toContain('NaN')
  expect(radarValues([-1, 9]).map(point => Math.hypot(point.x - RADAR.cx, point.y - RADAR.cy))).toEqual([0, RADAR.radius])
})
