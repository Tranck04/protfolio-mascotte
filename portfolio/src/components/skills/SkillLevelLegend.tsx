import { useEffect, useRef } from 'react'
import { Info, X } from 'lucide-react'
import { skillLevels } from '../../data/skills'

export function SkillLevelLegend({ active }: { active: boolean }) {
  const details = useRef<HTMLDetailsElement>(null)
  const summary = useRef<HTMLElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const close = () => { if (details.current) details.current.open = false; summary.current?.focus({ preventScroll: true }) }
  useEffect(() => { if (!active && details.current) details.current.open = false }, [active])
  useEffect(() => {
    if (!active) return
    let frame = 0
    const element = details.current!
    const place = () => {
      if (!element.open || !panel.current || !summary.current) return
      const view = window.visualViewport
      const left = (view?.offsetLeft ?? 0) + 16
      const top = (view?.offsetTop ?? 0) + 16
      const vw = view?.width || document.documentElement.clientWidth || window.innerWidth
      const vh = view?.height || document.documentElement.clientHeight || window.innerHeight
      const nav = document.querySelector('.floating-nav')?.getBoundingClientRect()
      const right = nav && nav.height > nav.width ? nav.left - 16 : left + vw - 32
      const bottom = nav && nav.width > nav.height ? nav.top - 16 : top + vh - 32
      const width = Math.min(340, right - left)
      const maxHeight = Math.min(430, bottom - top)
      Object.assign(panel.current.style, { width: `${width}px`, maxHeight: `${maxHeight}px` })
      const height = Math.min(panel.current.scrollHeight, maxHeight)
      const anchor = summary.current.getBoundingClientRect()
      const origin = element.getBoundingClientRect()
      const x = Math.max(left, Math.min(anchor.right - width, right - width))
      const preferredY = anchor.top - height - 10 >= top ? anchor.top - height - 10 : anchor.bottom + 10
      const y = Math.max(top, Math.min(preferredY, bottom - height))
      // Local offsets keep the panel aligned even inside a transformed, scrolling scene.
      Object.assign(panel.current.style, { left: `${x - origin.left}px`, top: `${y - origin.top}px`, right: 'auto', bottom: 'auto' })
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
    }
  }, [active])
  return <details className="skill-level-legend" ref={details} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() } }}>
    <summary ref={summary}><Info size={14} aria-hidden="true" />Lire l’échelle de niveaux</summary>
    <div className="skill-scale-content" ref={panel} role="region" data-scene-gesture-ignore="" aria-labelledby="skill-scale-title"><div className="skill-scale-heading"><h3 id="skill-scale-title">Une échelle qualitative.</h3><button type="button" aria-label="Fermer l’échelle de niveaux" onClick={close}><X size={16} /></button></div><p>Autoévaluation indicative. Les valeurs actuelles sont provisoires et doivent être validées.</p><ol>{Object.entries(skillLevels).map(([level, value]) => <li key={level}><span>{level}</span><div><strong>{value.label}</strong><p>{value.description}</p></div></li>)}</ol></div>
  </details>
}
