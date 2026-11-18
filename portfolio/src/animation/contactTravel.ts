export type TravelPose = { x: number; y: number; scale: number }
type Bounds = { left: number; top: number; width: number; height: number }
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(value, high))

/** Remove the scene's current translation before choosing its final viewport anchor. */
export function contactDock(stage: Bounds, marker: Bounds, panelY: number, baseRadius: number): TravelPose {
  const diameter = Math.min(marker.width, marker.height)
  const scale = diameter / (baseRadius * 2)
  const radius = diameter / 2
  return {
    x: clamp(marker.left + marker.width / 2 - stage.left, radius + 8, stage.width - radius - 8),
    y: clamp(marker.top + marker.height / 2 - stage.top - panelY, radius + 8, stage.height - radius - 8),
    scale,
  }
}

/** One continuous quadratic path, including scale; no opacity or duplicate visual. */
export function contactTravel(from: TravelPose, to: TravelPose, progress: number, baseRadius: number, viewport: { width: number; height: number }): TravelPose {
  const t = clamp(progress, 0, 1)
  const margin = baseRadius * Math.max(from.scale, to.scale) + 6
  const control = {
    x: clamp((from.x + to.x) / 2, margin, viewport.width - margin),
    y: clamp((from.y + to.y) / 2 - Math.min(Math.abs(to.x - from.x) * .12, margin), margin, viewport.height - margin),
  }
  return {
    x: (1 - t) ** 2 * from.x + 2 * (1 - t) * t * control.x + t ** 2 * to.x,
    y: (1 - t) ** 2 * from.y + 2 * (1 - t) * t * control.y + t ** 2 * to.y,
    scale: from.scale + (to.scale - from.scale) * t,
  }
}
