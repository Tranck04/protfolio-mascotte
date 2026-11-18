import type { Scene } from '../FloatingNavigation'

export type BackgroundShape = 'circle' | 'squircle' | 'triangle' | 'hexagon' | 'cloud'
export type BackgroundPoint = Readonly<{ x: number; y: number }>
export const BACKGROUND_SAMPLES = 48
export const sceneBackgrounds = {
  intro: 'circle', hero: 'circle', projects: 'squircle', journey: 'triangle', skills: 'hexagon', contact: 'cloud',
} as const satisfies Record<Scene, BackgroundShape>

const TAU = Math.PI * 2
/** Intersect the same polar rays with each regular polygon: winding and landmarks stay compatible. */
function polygonRadius(angle: number, sides: number, radius: number) {
  const sector = TAU / sides
  const offset = ((angle + Math.PI / 2) % sector + sector) % sector - sector / 2
  return radius * Math.cos(Math.PI / sides) / Math.cos(offset)
}
function sampleShape(shape: BackgroundShape): readonly BackgroundPoint[] {
  let radii = Array.from({ length: BACKGROUND_SAMPLES }, (_, i) => {
    const angle = -Math.PI / 2 + TAU * i / BACKGROUND_SAMPLES
    switch (shape) {
      case 'circle': return 90
      case 'squircle': return 87 / (Math.abs(Math.cos(angle)) ** 4.5 + Math.abs(Math.sin(angle)) ** 4.5) ** (1 / 4.5)
      case 'triangle': return polygonRadius(angle, 3, 116)
      case 'hexagon': return polygonRadius(angle, 6, 101)
      case 'cloud': return 88 + 9 * Math.cos(5 * angle + .3) + 4 * Math.sin(3 * angle - .5)
    }
  })
  // A small circular convolution rounds polygon corners without changing their topology.
  if (shape === 'triangle' || shape === 'hexagon') {
    radii = radii.map((radius, i) => .64 * radius + .18 * (radii[(i + BACKGROUND_SAMPLES - 1) % BACKGROUND_SAMPLES] + radii[(i + 1) % BACKGROUND_SAMPLES]))
  }
  return radii.map((radius, i) => {
    const angle = -Math.PI / 2 + TAU * i / BACKGROUND_SAMPLES
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
  })
}
export const backgroundShapes = Object.fromEntries(
  (['circle', 'squircle', 'triangle', 'hexagon', 'cloud'] as const).map(shape => [shape, sampleShape(shape)]),
) as Record<BackgroundShape, readonly BackgroundPoint[]>

/** Compatible 48-segment, closed cubic paths. Catmull–Rom tangents keep the contour C1-continuous. */
export function backgroundPath(points: readonly BackgroundPoint[]): string {
  const number = (value: number) => String(Math.round(value * 1000) / 1000)
  const pair = (point: BackgroundPoint) => `${number(point.x)},${number(point.y)}`
  const count = points.length
  let path = `M${pair(points[0])}`
  for (let i = 0; i < count; i++) {
    const previous = points[(i + count - 1) % count]
    const current = points[i], next = points[(i + 1) % count], after = points[(i + 2) % count]
    const first = { x: current.x + (next.x - previous.x) / 6, y: current.y + (next.y - previous.y) / 6 }
    const second = { x: next.x - (after.x - current.x) / 6, y: next.y - (after.y - current.y) / 6 }
    path += `C${pair(first)} ${pair(second)} ${pair(next)}`
  }
  return `${path}Z`
}
export function interpolateBackground(from: readonly BackgroundPoint[], to: readonly BackgroundPoint[], progress: number): readonly BackgroundPoint[] {
  const t = Math.max(0, Math.min(1, progress))
  if (t === 0) return from
  if (t === 1) return to
  return from.map((point, index) => ({ x: point.x + (to[index].x - point.x) * t, y: point.y + (to[index].y - point.y) * t }))
}

export type BackgroundPlacement = { x: number; y: number; scale: number; rotation: number }

/** Viewport-relative composition, with actual circles in both portrait and landscape viewports. */
export function backgroundLayout(width: number, height: number) {
  const compact = width <= 760
  const radius = compact ? Math.min(width * .7, height * .48) : Math.min(width * .34, height * .69)
  const secondary = compact ? width * .35 : Math.min(width * .19, height * .36)
  return {
    main: { x: width * (compact ? 1.12 : .97), y: height * (compact ? .08 : .06), scale: radius / 100, rotation: -12 },
    echo: { x: width * (compact ? -.07 : .015), y: height * 1.02, scale: secondary / 100, rotation: 24 },
    halo: { cx: width * .96, cy: height * .12, rx: radius * 1.6, ry: radius * 1.6 },
  }
}

/** The rotation stays in the local space of the contour, so the group spins in place. */
export function backgroundTransform(placement: BackgroundPlacement, spin = 0): string {
  return `translate(${placement.x} ${placement.y}) scale(${placement.scale}) rotate(${placement.rotation + spin})`
}
