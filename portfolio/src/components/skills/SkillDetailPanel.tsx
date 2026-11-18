import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { skillLevels, resolveSkillReferenceTitle } from '../../data/skills'
import type { SkillDomain } from '../../data/skills'
import { projectById } from '../../data/projects'

export function SkillDetailPanel({ domain, reduced, openProject }: { domain: SkillDomain; reduced: boolean; openProject: (id: string) => void }) {
  const content = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo(content.current, { opacity: .3, y: 6 }, { opacity: 1, y: 0, duration: .2, ease: 'power2.out', overwrite: true })
    })
    return () => ctx.revert()
  }, [domain.id, reduced])
  const level = skillLevels[domain.level]
  const groups = (domain.skillGroups ?? []).filter(group => group.items.length > 0)
  return <aside className="skill-details" id="skill-detail-panel" data-scroll-region="" role="region" aria-labelledby="skill-domain-title">
    <div className="skill-detail-content" ref={content}>
      <div className="skill-detail-heading"><p className="skill-detail-eyebrow">LE DOMAINE EN CLAIR</p><h3 id="skill-domain-title">{domain.title}<span>.</span></h3><p className="skill-level"><span>{String(domain.level).padStart(2, '0')} / 05</span><strong>{level.label}</strong></p>{domain.tagline && <p className="skill-tagline">{domain.tagline}</p>}</div>
      <p className="skill-description">{domain.description}</p>
      <div className="skill-technologies"><h4>Compétences & technologies</h4>{groups.length > 0 ? groups.map(group => <div className="skill-group" key={group.label}><h5>{group.label}</h5><ul className="skill-tags" aria-label={group.label}>{group.items.map(item => <li key={item}>{item}</li>)}</ul></div>) : <ul className="skill-tags" aria-label={`Compétences — ${domain.title}`}>{domain.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>}</div>
      <div className="skill-projects"><h4>Réalisations associées</h4>{domain.projectReferences.length > 0 ? <ul>{domain.projectReferences.map(reference => {
        const projectId = reference.projectId
        const project = projectId ? projectById.get(projectId) : undefined
        const title = resolveSkillReferenceTitle(reference)
        const key = projectId ?? reference.title ?? reference.description
        const body = <><span className="skill-reference-title">{title}</span><span className="skill-reference-desc">{reference.description}</span>{project && <ArrowUpRight size={16} aria-hidden="true" />}</>
        return <li key={key}>{project ? <button type="button" className="skill-reference" onClick={() => openProject(projectId!)} aria-label={`Consulter ${title} depuis les compétences`}>{body}</button> : <span className="skill-reference skill-reference-static">{body}</span>}</li>
      })}</ul> : <p className="skill-no-project">Aucune association documentée dans le catalogue actuel.</p>}</div>
      {domain.growthAreas.length > 0 && <div className="skill-growth"><h4>Axes de progression</h4><ul className="skill-growth-list">{domain.growthAreas.map(area => <li key={area}>{area}</li>)}</ul></div>}
    </div>
  </aside>
}
