import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, GraduationCap, MapPin, Users } from 'lucide-react'
import gsap from 'gsap'
import { journeyCategories } from '../../data/journey'
import type { JourneyEntry } from '../../data/journey'

const icons = { education: GraduationCap, experience: BriefcaseBusiness, certification: BadgeCheck, leadership: Users }

/** Permanent editorial detail panel for the active journey milestone. */
export function JourneyPanel({ entry, reduced, openProject }: { entry: JourneyEntry; reduced: boolean; openProject: (id: string) => void }) {
  const Icon = icons[entry.category]
  const inner = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  useLayoutEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (reduced || !inner.current) return
    const tween = gsap.fromTo(inner.current, { autoAlpha: 0, y: 9 }, { autoAlpha: 1, y: 0, duration: .24, ease: 'power2.out', overwrite: true })
    return () => { tween.kill() }
  }, [entry.id, reduced])
  const validLink = entry.link && /^https?:\/\//.test(entry.link)
  const tags = [...(entry.technologies ?? []), ...(entry.skills ?? [])]
  return <aside className={`journey-detail category-${entry.category}`} id="journey-detail-panel" role="region" aria-labelledby="journey-panel-title" data-scroll-region="">
    <div className="journey-detail-inner" ref={inner}>
      <p className="journey-detail-category"><Icon size={14} strokeWidth={1.6} aria-hidden="true" /> {journeyCategories[entry.category].shortLabel}</p>
      <h3 id="journey-panel-title">{entry.title}</h3>
      <p className="journey-detail-organization">{entry.organization}</p>
      <div className="journey-detail-meta">
        <span className="journey-detail-period">{entry.displayPeriod}</span>
        {entry.location && <span className="journey-detail-location"><MapPin size={12} aria-hidden="true" />{entry.location}</span>}
        {entry.mode && <span className="journey-detail-mode">{entry.mode}</span>}
        {entry.typeLabel && <span>{entry.typeLabel}</span>}
      </div>
      {entry.description && <p className="journey-detail-description">{entry.description}</p>}
      {!!entry.highlights?.length && <div className="journey-section"><h4>Responsabilités et réalisations</h4><ol className="journey-numbered">{entry.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ol></div>}
      {entry.example && <div className="journey-section"><h4>Exemple concret</h4><p className="journey-example">{entry.example}</p></div>}
      {tags.length > 0 && <div className="journey-section"><h4>{entry.technologies?.length ? 'Technologies' : 'Compétences'}</h4><ul className="journey-techs">{tags.map(tag => <li key={tag}>{tag}</li>)}</ul></div>}
      {entry.result && <div className="journey-section"><h4>Résultat</h4><p className="journey-result">{entry.result}</p></div>}
      {entry.projectId && <button type="button" className="journey-panel-link" onClick={() => openProject(entry.projectId!)}>Explorer le projet<ArrowUpRight size={14} aria-hidden="true" /></button>}
      {validLink && <a className="journey-panel-link" href={entry.link} target="_blank" rel="noopener noreferrer">En savoir plus <ArrowUpRight size={14} /></a>}
    </div>
  </aside>
}
