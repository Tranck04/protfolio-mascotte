import type { ContentScene } from './sceneTransition'
import { CONTENT_SCENES } from './sceneTransition'

export function adjacentScene(scene: 'intro' | ContentScene, direction: number): ContentScene | undefined {
  const index = CONTENT_SCENES.indexOf(scene as ContentScene)
  return index >= 0 && direction !== 0 ? CONTENT_SCENES[index + Math.sign(direction)] : undefined
}

/** One wheel burst / touch gesture / non-repeated key press can claim one scene change. */
export function bindSceneGestures({ element, current, locked, projectsMain, navigate }: {
  element: HTMLElement; current: () => 'intro' | ContentScene; locked: () => boolean;
  projectsMain: () => boolean; navigate: (scene: ContentScene) => boolean;
}) {
  let lastWheel = -Infinity
  let claimed = false
  let accumulated = 0
  let previousDirection = 0
  let touch: { x: number; y: number; target: EventTarget | null; direction: number } | null = null
  const targetElement = (target: EventTarget | null) => target instanceof Element ? target : null
  const inDialog = (target: EventTarget | null) => targetElement(target)?.closest('.project-overlay, [role="dialog"], [data-scene-gesture-ignore]') != null
  const canExit = (target: EventTarget | null, direction: number) => {
    if (current() === 'intro' || (current() === 'projects' && !projectsMain())) return false
    const node = targetElement(target)
    if (node?.closest('input, textarea, select, [contenteditable="true"], .floating-nav, .project-overlay, [role="dialog"], [data-scene-gesture-ignore]')) return false
    let scroll = node?.closest<HTMLElement>('[data-scene-scroll]')
    while (scroll) {
      const max = scroll.scrollHeight - scroll.clientHeight
      if (max > 2 && (direction > 0 ? scroll.scrollTop < max - 2 : scroll.scrollTop > 2)) return false
      scroll = scroll.parentElement?.closest<HTMLElement>('[data-scene-scroll]')
    }
    return adjacentScene(current(), direction) !== undefined
  }
  const change = (direction: number) => { const next = adjacentScene(current(), direction); return next ? navigate(next) : false }
  const wheel = (event: WheelEvent) => {
    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
    if (inDialog(event.target)) return
    const now = performance.now()
    const direction = Math.sign(event.deltaY)
    if (now - lastWheel > 240) { claimed = false; accumulated = 0; previousDirection = direction }
    lastWheel = now
    if (locked()) { claimed = true; event.preventDefault(); return }
    if (!canExit(event.target, direction)) return
    event.preventDefault()
    if (claimed) return
    if (direction !== previousDirection) accumulated = 0
    previousDirection = direction
    accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1)
    if (Math.abs(accumulated) >= 42) { claimed = true; change(direction) }
  }
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.repeat || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return
    if (targetElement(event.target)?.closest('button, a, input, textarea, select, summary, [contenteditable="true"], .project-overlay, [role="dialog"], [data-scene-gesture-ignore]')) return
    const direction = ['ArrowDown', 'PageDown'].includes(event.key) ? 1 : ['ArrowUp', 'PageUp'].includes(event.key) ? -1 : 0
    if (!direction || locked() || !canExit(event.target, direction)) return
    event.preventDefault()
    change(direction)
  }
  const touchstart = (event: TouchEvent) => {
    if (locked() || event.touches.length !== 1 || inDialog(event.target)) { touch = null; return }
    const point = event.touches[0]
    touch = { x: point.clientX, y: point.clientY, target: event.target, direction: 0 }
    // Eligibility is captured before native scrolling, so reaching an edge doesn't steal a swipe.
    const down = canExit(event.target, 1)
    const up = canExit(event.target, -1)
    touch.direction = down && up ? 2 : down ? 1 : up ? -1 : 0
  }
  const touchmove = (event: TouchEvent) => {
    if (!touch || event.touches.length !== 1) return
    const dx = event.touches[0].clientX - touch.x
    const dy = touch.y - event.touches[0].clientY
    if (locked() || ((touch.direction === 2 || Math.sign(dy) === touch.direction) && Math.abs(dy) > Math.max(8, Math.abs(dx)))) event.preventDefault()
  }
  const touchend = (event: TouchEvent) => {
    const start = touch
    touch = null
    if (!start || locked() || !event.changedTouches.length) return
    const point = event.changedTouches[0]
    const dy = start.y - point.clientY
    if (Math.abs(dy) >= 55 && Math.abs(dy) > Math.abs(point.clientX - start.x) * 1.3 && (start.direction === 2 || Math.sign(dy) === start.direction)) change(Math.sign(dy))
  }
  const cancel = () => { touch = null }
  element.addEventListener('wheel', wheel, { passive: false })
  element.addEventListener('keydown', keydown)
  element.addEventListener('touchstart', touchstart, { passive: true })
  element.addEventListener('touchmove', touchmove, { passive: false })
  element.addEventListener('touchend', touchend, { passive: true })
  element.addEventListener('touchcancel', cancel)
  return () => {
    element.removeEventListener('wheel', wheel); element.removeEventListener('keydown', keydown)
    element.removeEventListener('touchstart', touchstart); element.removeEventListener('touchmove', touchmove)
    element.removeEventListener('touchend', touchend); element.removeEventListener('touchcancel', cancel)
  }
}

