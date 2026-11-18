import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { resolveSkillProjects, skillLevels } from '../../data/skills'
import type { SkillDomain } from '../../data/skills'

export function SkillDetailPanel({ domain, reduced, openProject }: { domain: SkillDomain; reduced: boolean; openProject: (id: string) => void }) {
  const content = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(content.current, { opacity: .3, y: 6 }, { opacity: 1, y: 0, duration: .2, ease: 'power2.out', overwrite: true })
    })
    return () => ctx.revert()
  }, [domain.id, reduced])
  const projects = resolveSkillProjects(domain)
  const level = skillLevels[domain.level]
  return <aside className="skill-details" id="skill-detail-panel" data-scene-scroll="" role="region" aria-labelledby="skill-domain-title">
    <div className="skill-detail-content" ref={content}>
      <div className="skill-detail-heading"><p className="skill-detail-eyebrow">LE DOMAINE EN CLAIR</p><h3 id="skill-domain-title">{domain.name}<span>.</span></h3><p className="skill-level"><span>{String(domain.level).padStart(2, '0')} / 05</span><strong>{level.label}</strong></p></div>
      <p className="skill-description">{domain.description}</p>
      <div className="skill-technologies"><h4>Technologies & méthodes</h4><ul className="skill-tags" aria-label={`Technologies et méthodes — ${domain.name}`}>{domain.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul></div>
      {domain.experience && <p className="skill-experience">Pratique : {domain.experience}</p>}
      <div className="skill-projects"><h4>Projets associés</h4>{projects.length ? <ul>{projects.map(project => <li key={project.id}><button type="button" onClick={() => openProject(project.id)} aria-label={`Consulter ${project.title} depuis les compétences`}><span>{project.title}</span>{project.status && <small>{project.status}</small>}<ArrowUpRight size={16} /></button></li>)}</ul> : <p className="skill-no-project">Aucune association documentée dans le catalogue actuel.</p>}</div>
    </div>
  </aside>
}
