import { useEffect } from 'react'
import type { RefObject } from 'react'

/** Observe the existing overlay scroller, without cancelling or synthesising a scroll. */
export function useGalleryScrollIntent(root: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    const scroller = root.current?.closest<HTMLElement>('.overlay-scroll')
    if (!open || !scroller) return
    let wheelTotal = 0, lastWheel = 0, baseline = scroller.scrollTop
    let touch: { x: number; y: number } | undefined
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      if (event.deltaY <= 0) { wheelTotal = 0; return }
      const now = performance.now()
      if (now - lastWheel > 200) wheelTotal = 0
      lastWheel = now
      wheelTotal += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1)
      if (wheelTotal >= 32) close()
    }
    const start = (event: TouchEvent) => {
      touch = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : undefined
    }
    const move = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return
      const dx = event.touches[0].clientX - touch.x, dy = touch.y - event.touches[0].clientY
      if (dy >= 32 && dy > Math.abs(dx) * 1.3) { touch = undefined; close() }
    }
    const scroll = () => {
      if (scroller.scrollTop - baseline >= 24) close()
      else if (scroller.scrollTop < baseline) baseline = scroller.scrollTop
    }
    scroller.addEventListener('wheel', wheel, { passive: true })
    scroller.addEventListener('touchstart', start, { passive: true })
    scroller.addEventListener('touchmove', move, { passive: true })
    scroller.addEventListener('scroll', scroll, { passive: true })
    return () => {
      scroller.removeEventListener('wheel', wheel)
      scroller.removeEventListener('touchstart', start)
      scroller.removeEventListener('touchmove', move)
      scroller.removeEventListener('scroll', scroll)
    }
  }, [root, open, close])
}
