export type RadarPoint = { x: number; y: number }
export const RADAR = { width: 560, height: 470, cx: 280, cy: 245, radius: 170, labelRadius: 205, maxLevel: 5 } as const

export function radarPoint(index: number, count: number, radius: number): RadarPoint {
  const angle = -Math.PI / 2 + index * Math.PI * 2 / count
  return { x: RADAR.cx + Math.cos(angle) * radius, y: RADAR.cy + Math.sin(angle) * radius }
}
export function radarValues(levels: readonly number[]): RadarPoint[] {
  return levels.map((level, index) => radarPoint(index, levels.length, RADAR.radius * Math.max(0, Math.min(RADAR.maxLevel, level)) / RADAR.maxLevel))
}
export function polygonPoints(points: readonly RadarPoint[]): string {
  return points.map(point => `${Number(point.x.toFixed(3))},${Number(point.y.toFixed(3))}`).join(' ')
}
export function radarRing(level: number, count = 5): string {
  return polygonPoints(radarValues(Array.from({ length: count }, () => level)))
}
