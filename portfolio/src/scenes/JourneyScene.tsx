import { useLayoutEffect, useRef, useState } from 'react'
import type { FocusEvent, Ref } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import gsap from 'gsap'
import { chronologicalJourney, journeyCategories } from '../data/journey'
import { JourneyPanel } from '../components/journey/JourneyPanel'

export function JourneyScene({ sceneRef, active, visible, reduced, projects, skills, openProject }: {
  sceneRef: Ref<HTMLElement>; active: boolean; visible: boolean; reduced: boolean; projects: () => void; skills: () => void; openProject: (id: string) => void;
}) {
  const content = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState<string | null>(chronologicalJourney[0]?.id ?? null)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const displayedId = previewId ?? selectedId
  const entry = chronologicalJourney.find(item => item.id === displayedId) ?? null

  useLayoutEffect(() => {
    if (!visible) return
    const ctx = gsap.context(() => {
      const line = content.current!.querySelector('[data-journey-line]')
      const milestones = [...content.current!.querySelectorAll<HTMLElement>('.journey-milestone')]
      const detail = content.current!.querySelector<HTMLElement>('.journey-detail-slot')
      if (reduced) { gsap.set([line, ...milestones, detail].filter(Boolean), { clearProps: 'all' }); return }
      gsap.timeline()
        .fromTo(line, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .8, ease: 'power2.inOut' }, .18)
        .fromTo(milestones, { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: .06, duration: .42, ease: 'power2.out' }, .3)
        .fromTo(detail, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .36)
    }, content)
    return () => ctx.revert()
  }, [visible, reduced])

  const preview = (id: string) => setPreviewId(current => current === id ? current : id)
  const restore = () => setPreviewId(null)
  const commit = (id: string) => { setSelectedId(id); setPreviewId(null) }
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) restore() }

  return <section className="scene-panel journey-panel" ref={sceneRef} data-scene-scroll="" aria-labelledby="journey-title" aria-hidden={!active} inert={!active}>
    <div className="journey-shell" ref={content}>
      <div className="journey-topline"><span className="eyebrow"><span className="tiny-dot" />03 — PARCOURS</span><span>APPRENDRE / PRATIQUER / ÉVOLUER</span></div>
      <div className="scene-body" data-scene-scroll=""><div className="journey-heading"><h2 id="journey-title" tabIndex={-1}>Mon <em>parcours.</em></h2><p>Études, expériences et apprentissages.</p></div>
      <div className="journey-layout">
        <div className="journey-timeline" data-scroll-region="" onPointerLeave={restore} onBlur={handleBlur}>
          <span className="journey-rail" aria-hidden="true" />
          <svg className="journey-line" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true"><path data-journey-line="" d="M1 0 V100" pathLength="1" /></svg>
          <ol aria-label="Parcours du plus récent au plus ancien">{chronologicalJourney.map(item => {
            const isSelected = item.id === selectedId
            const isActive = item.id === displayedId
            return <li key={item.id} className={`journey-milestone category-${item.category} ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}>
              <button type="button" className="journey-trigger" data-journey-trigger={item.id} aria-pressed={isSelected}
                onPointerEnter={event => { if (event.pointerType !== 'touch') preview(item.id) }}
                onFocus={() => preview(item.id)}
                onClick={() => commit(item.id)}>
                <span className="journey-point" aria-hidden="true" />
                <span className="journey-event-label"><span className="journey-period">{item.displayPeriod}</span><span className="journey-event-title">{item.title}</span><span className="journey-event-organization">{item.organization}</span><span className="journey-event-category">{journeyCategories[item.category].shortLabel}</span></span>
              </button>
            </li>
          })}</ol>
        </div>
        <div className="journey-detail-slot">
          {entry && <JourneyPanel entry={entry} reduced={reduced} openProject={openProject} />}
        </div>
      </div>
      </div><div className="journey-bottom"><button className="journey-return" onClick={projects}><ArrowUp size={14} />Projets</button><button className="journey-return" onClick={skills}>Compétences <ArrowDown size={14}/></button></div>
    </div>
  </section>
}
