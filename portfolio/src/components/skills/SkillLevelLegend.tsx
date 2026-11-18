import { useCallback, useEffect, useRef } from 'react'
import { Info, X } from 'lucide-react'
import { skillLevels } from '../../data/skills'
import { skillLegendPosition } from './skillLegendPosition'

export function SkillLevelLegend({ active }: { active: boolean }) {
  const details = useRef<HTMLDetailsElement>(null)
  const summary = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const hide = useCallback(() => { try { panel.current?.hidePopover?.() } catch { /* Fallback browsers use the details element. */ } }, [])
  const close = () => { hide(); if (details.current) details.current.open = false; summary.current?.focus({ preventScroll: true }) }
  useEffect(() => { if (!active && details.current) { details.current.open = false; hide() } }, [active, hide])
  useEffect(() => {
    if (!active) return
    let frame = 0
    const element = details.current!
    const place = () => {
      if (!element.open) { hide(); return }
      if (!panel.current || !summary.current) return
      let topLayer = false
      try {
        // A native top-layer panel escapes the central scroller's clipping without moving the trigger.
        if (panel.current.showPopover) { if (!panel.current.matches(':popover-open')) panel.current.showPopover(); topLayer = true }
      } catch { /* Keep the original in-scene fallback if popovers are unsupported. */ }
      const view = window.visualViewport
      const left = (view?.offsetLeft ?? 0) + 16
      const top = (view?.offsetTop ?? 0) + 16
      const vw = view?.width || document.documentElement.clientWidth || window.innerWidth
      const vh = view?.height || document.documentElement.clientHeight || window.innerHeight
      const nav = document.querySelector('.floating-nav')?.getBoundingClientRect()
      const right = nav && nav.height > nav.width ? nav.left - 16 : left + vw - 32
      const bottom = nav && nav.width > nav.height ? nav.top - 16 : top + vh - 32
      const anchor = summary.current.getBoundingClientRect()
      const origin = element.getBoundingClientRect()
      const column = element.closest('.skills-chart-column')?.getBoundingClientRect()
      const chart = element.closest('.skills-chart-column')?.querySelector('.skills-radar')
      const protectedRects = [...(chart?.querySelectorAll('.radar-grids, .radar-axis-label') ?? [])]
        .map(node => node.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0)
      const radar = protectedRects.length ? {
        left: Math.min(...protectedRects.map(rect => rect.left)), right: Math.max(...protectedRects.map(rect => rect.right)),
        top: Math.min(...protectedRects.map(rect => rect.top)), bottom: Math.max(...protectedRects.map(rect => rect.bottom)),
      } : chart?.getBoundingClientRect()
      const detail = element.closest('.skills-layout')?.querySelector('.skill-details')?.getBoundingClientRect()
      const heading = element.closest('.skills-shell')?.querySelector('.skills-heading')?.getBoundingClientRect()
      const clip = !topLayer ? element.closest('.scene-body')?.getBoundingClientRect() : undefined
      const bounds = {
        left: Math.max(left, clip && clip.width > 0 ? clip.left : left),
        top: Math.max(top, clip && clip.height > 0 ? clip.top : top),
        right: Math.max(left + 1, Math.min(right, clip && clip.width > 0 ? clip.right : right)),
        bottom: Math.max(top + 1, Math.min(bottom, clip && clip.height > 0 ? clip.bottom : bottom)),
      }
      const placement = skillLegendPosition({
        viewport: bounds,
        radar: radar && radar.right > radar.left ? radar : { left: anchor.left, right: anchor.right, top: anchor.top, bottom: anchor.bottom },
        column: column && column.width > 0 ? { ...bounds, left: column.left, right: Math.min(column.right, detail && detail.width > 0 ? detail.left - 12 : right) } : bounds,
        headingBottom: heading && heading.height > 0 ? heading.bottom : top - 12,
        desiredHeight: panel.current.scrollHeight || 430,
      })
      Object.assign(panel.current.style, {
        position: topLayer ? 'fixed' : 'absolute', width: `${placement.width}px`, maxHeight: `${placement.maxHeight}px`,
        left: `${placement.left - (topLayer ? 0 : origin.left)}px`, top: `${placement.top - (topLayer ? 0 : origin.top)}px`, right: 'auto', bottom: 'auto',
      })
    }
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place) }
    element.addEventListener('toggle', place)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      cancelAnimationFrame(frame); element.removeEventListener('toggle', place)
      window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update); window.visualViewport?.removeEventListener('scroll', update)
      hide()
    }
  }, [active, hide])
  return <details className="skill-level-legend" ref={details} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() } }}>
    <summary ref={summary}><Info size={14} aria-hidden="true" />Lire l’échelle de niveaux</summary>
    <div className="skill-scale-content" popover="manual" ref={panel} role="region" data-scene-gesture-ignore="" aria-labelledby="skill-scale-title"><div className="skill-scale-heading"><h3 id="skill-scale-title">Une échelle qualitative.</h3><button type="button" aria-label="Fermer l’échelle de niveaux" onClick={close}><X size={16} /></button></div><p>Autoévaluation indicative, reflétant mon niveau d’autonomie et la complexité des réalisations effectuées.</p><ol>{Object.entries(skillLevels).map(([level, value]) => <li key={level}><span>{level}</span><div><strong>{value.label}</strong><p>{value.description}</p></div></li>)}</ol></div>
  </details>
}
