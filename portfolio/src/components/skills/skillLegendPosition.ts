type Bounds = { left: number; right: number; top: number; bottom: number }
type Placement = { left: number; top: number; width: number; maxHeight: number }
const gap = 12

/** Choose a free rectangle, never a position over the radar or the detail column. */
export function skillLegendPosition({ viewport, radar, column, headingBottom, desiredHeight }: {
  viewport: Bounds; radar: Bounds; column: Bounds; headingBottom: number; desiredHeight: number;
}): Placement {
  const above = {
    left: Math.max(viewport.left, column.left), right: Math.min(viewport.right, column.right),
    top: Math.max(viewport.top, headingBottom + gap), bottom: Math.min(viewport.bottom, radar.top - gap),
  }
  const beside = {
    left: viewport.left, right: Math.min(viewport.right, radar.left - gap),
    top: Math.max(viewport.top, radar.top - 48), bottom: viewport.bottom,
  }
  let area = above.bottom - above.top >= 180 && above.right - above.left >= 220 ? above
    : beside.right - beside.left >= 220 && beside.bottom - beside.top >= 140 ? beside : above
  // Compact screens may have no band between the scene title and the radar.
  // Use the visible space above it (or below a radar scrolled out of view), never the chart itself.
  if (area.bottom - area.top < 80) {
    const upper = { ...above, top: viewport.top }
    const lower = { ...above, top: Math.max(viewport.top, radar.bottom + gap), bottom: Math.min(viewport.bottom, column.bottom) }
    area = upper.bottom - upper.top >= 80 ? upper : lower.bottom - lower.top >= 80 ? lower : area
  }
  const width = Math.max(1, Math.min(340, area.right - area.left))
  const maxHeight = Math.max(1, Math.min(430, desiredHeight, area.bottom - area.top))
  return {
    // Align with the radar's upper left corner, or just outside it in the left gutter.
    left: area === beside ? area.right - width : area.left,
    top: Math.max(viewport.top, Math.min(area.top, viewport.bottom - maxHeight)),
    width, maxHeight,
  }
}
