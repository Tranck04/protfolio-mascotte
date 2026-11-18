/**
 * Shared contract for nested scrollable / interactive regions.
 *
 * A region marked with `data-scroll-region` owns its wheel, touch and keyboard
 * interactions. The global scene navigation must never claim an event that
 * originates inside such a region, even when that region reaches a scroll limit.
 * This keeps the convention scene-agnostic and extensible: new components only
 * need to opt in with the attribute.
 */
export const SCROLL_REGION_ATTRIBUTE = 'data-scroll-region'
export const SCROLL_REGION_SELECTOR = `[${SCROLL_REGION_ATTRIBUTE}]`

/** Returns the nearest `data-scroll-region` ancestor of the event's real origin, or null. */
export function getScrollRegionFromEvent(event: Event): HTMLElement | null {
  const path = typeof event.composedPath === 'function' ? event.composedPath() : null
  const nodes = path && path.length > 0 ? path : (event.target instanceof Element ? [event.target] : [])
  for (const node of nodes) {
    if (node instanceof Element) {
      const region = node.closest<HTMLElement>(SCROLL_REGION_SELECTOR)
      if (region) return region
    }
  }
  return null
}
