import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, GraduationCap, MapPin } from 'lucide-react'
import gsap from 'gsap'
import { journeyCategories } from '../../data/journey'
import type { JourneyEntry } from '../../data/journey'

const icons = { education: GraduationCap, experience: BriefcaseBusiness, certification: BadgeCheck }

/** Permanent editorial detail panel for the active journey milestone. */
export function JourneyPanel({ entry, reduced }: { entry: JourneyEntry; reduced: boolean }) {
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
  return <aside className={`journey-detail category-${entry.category}`} id="journey-detail-panel" role="region" aria-labelledby="journey-panel-title">
    <div className="journey-detail-inner" ref={inner}>
      <p className="journey-detail-category"><Icon size={14} strokeWidth={1.6} aria-hidden="true" /> {journeyCategories[entry.category].shortLabel}</p>
      <h3 id="journey-panel-title">{entry.title}</h3>
      {entry.typeLabel && <p className="journey-detail-type">{entry.typeLabel}</p>}
      <p className="journey-detail-organization">{entry.organization}</p>
      <div className="journey-detail-meta">
        <span className="journey-detail-period">{entry.displayPeriod}</span>
        {entry.location && <span className="journey-detail-location"><MapPin size={12} aria-hidden="true" />{entry.location}</span>}
      </div>
      {entry.description && <p className="journey-detail-description">{entry.description}</p>}
      {!!entry.highlights?.length && <ul className="journey-highlights">{entry.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>}
      {!!entry.technologies?.length && <ul className="journey-techs" aria-label="Technologies utilisées">{entry.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>}
      {validLink && <a className="journey-panel-link" href={entry.link} target="_blank" rel="noopener noreferrer">En savoir plus <ArrowUpRight size={14} /></a>}
    </div>
  </aside>
}
