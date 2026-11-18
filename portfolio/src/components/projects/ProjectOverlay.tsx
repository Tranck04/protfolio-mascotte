import { useEffect, useLayoutEffect, useRef } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import gsap from 'gsap'
import { X } from 'lucide-react'
import type { Project } from '../../data/projects'
import { ProjectDetail } from './ProjectDetail'

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Floating consultation panel. It opens from the real card coordinates and
 * retracts back to them, so the visitor never leaves the gallery.
 */
export function ProjectOverlay({ project, source, reduced, onClose }: {
  project: Project
  source: HTMLElement | null
  reduced: boolean
  onClose: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const closingRef = useRef(false)

  const computeTarget = () => {
    const doc = rootRef.current?.ownerDocument?.documentElement ?? document.documentElement
    const vw = doc.clientWidth || window.innerWidth
    const vh = doc.clientHeight || window.innerHeight
    const compact = vw < 760
    const width = Math.min(vw * (compact ? 0.92 : 0.9), compact ? 680 : 1180)
    const height = Math.min(vh * (compact ? 0.9 : 0.88), compact ? 720 : 920)
    return {
      left: Math.round((vw - width) / 2),
      top: Math.round((vh - height) / 2),
      width: Math.round(width),
      height: Math.round(height),
    }
  }

  const sourceRadius = () => {
    if (!source?.isConnected) return 24
    const radius = parseFloat(getComputedStyle(source).borderTopLeftRadius)
    return Number.isFinite(radius) && radius > 0 ? radius : 20
  }

  useLayoutEffect(() => {
    restoreRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const panel = panelRef.current
    const backdrop = backdropRef.current
    if (!panel || !backdrop) return
    const target = computeTarget()
    const openFocus = () => closeRef.current?.focus({ preventScroll: true })
    if (reduced || !source || !source.isConnected) {
      gsap.set(panel, { width: target.width, height: target.height, x: target.left, y: target.top, borderRadius: 24, opacity: 1 })
      gsap.set(backdrop, { autoAlpha: 1 })
      openFocus()
      return
    }
    const root = rootRef.current
    if (!root) return
    const rootRect = root.getBoundingClientRect()
    const sourceRect = source.getBoundingClientRect()
    gsap.set(panel, {
      width: sourceRect.width,
      height: sourceRect.height,
      x: sourceRect.left - rootRect.left,
      y: sourceRect.top - rootRect.top,
      borderRadius: sourceRadius(),
      opacity: 1,
    })
    gsap.set(backdrop, { autoAlpha: 0 })
    try {
      timelineRef.current = gsap.timeline({ onComplete: openFocus })
        .to(panel, { width: target.width, height: target.height, x: target.left, y: target.top, borderRadius: 24, duration: 0.55, ease: 'power3.inOut' }, 0)
        .to(backdrop, { autoAlpha: 1, duration: 0.4, ease: 'power1.out' }, 0)
    } catch {
      gsap.set(panel, { width: target.width, height: target.height, x: target.left, y: target.top, borderRadius: 24 })
      gsap.set(backdrop, { autoAlpha: 1 })
      openFocus()
    }
    return () => {
      timelineRef.current?.kill()
      timelineRef.current = null
    }
    // The overlay is remounted for each opening, so these values are stable for its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (closingRef.current || !panelRef.current) return
      const activeTimeline = timelineRef.current
      if (activeTimeline?.isActive()) {
        activeTimeline.progress(1)
        if (closingRef.current) return
      }
      const target = computeTarget()
      gsap.set(panelRef.current, { width: target.width, height: target.height, x: target.left, y: target.top, borderRadius: 24 })
    }
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [])

  const close = () => {
    if (closingRef.current) return
    closingRef.current = true
    const restore = () => restoreRef.current?.focus({ preventScroll: true })
    const panel = panelRef.current
    const backdrop = backdropRef.current
    const root = rootRef.current
    if (reduced || !panel || !backdrop || !root || !source || !source.isConnected) {
      restore()
      onClose()
      return
    }
    timelineRef.current?.kill()
    const rootRect = root.getBoundingClientRect()
    const sourceRect = source.getBoundingClientRect()
    try {
      timelineRef.current = gsap.timeline({ onComplete: () => { restore(); onClose() } })
        .to(panel, { width: sourceRect.width, height: sourceRect.height, x: sourceRect.left - rootRect.left, y: sourceRect.top - rootRect.top, borderRadius: sourceRadius(), duration: 0.5, ease: 'power3.inOut' }, 0)
        .to(backdrop, { autoAlpha: 0, duration: 0.35, ease: 'power1.in' }, 0)
    } catch {
      restore()
      onClose()
    }
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(element =>
      !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true' && element.tabIndex !== -1,
    )
    if (!focusables.length) { event.preventDefault(); return }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement
    if (event.shiftKey) {
      if (active === first || !panel.contains(active)) { event.preventDefault(); last.focus() }
    } else if (active === last || !panel.contains(active)) { event.preventDefault(); first.focus() }
  }

  const handleBackdropMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close()
  }

  return <div className="project-overlay" ref={rootRef} onKeyDown={handleKeyDown}>
    <div className="project-overlay-backdrop" ref={backdropRef} onMouseDown={handleBackdropMouseDown} aria-hidden="true" />
    <section ref={panelRef} className="project-overlay-panel" role="dialog" aria-modal="true" aria-labelledby="project-detail-title" tabIndex={-1}>
      <button ref={closeRef} type="button" className="overlay-close" aria-label="Fermer le projet" onClick={close}><X size={18} strokeWidth={1.7} /></button>
      <div className="overlay-scroll">
        <ProjectDetail project={project} />
        {!!project.captures?.length && <section className="overlay-captures" aria-label="Captures supplémentaires">
          <h3>Captures supplémentaires</h3>
          <div className="overlay-capture-grid">{project.captures.map((capture, index) => <img key={capture} src={capture} alt={`Capture ${index + 1} de ${project.title}`} loading="lazy" />)}</div>
        </section>}
      </div>
    </section>
  </div>
}
