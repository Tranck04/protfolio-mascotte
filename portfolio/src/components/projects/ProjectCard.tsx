import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties, MouseEvent } from 'react'
import type { Project } from '../../data/projects'
import { ProjectVisual } from './ProjectVisual'

export function ProjectCard({ project, index, open }: { project: Project; index: number; open: (source: HTMLElement) => void }) {
  const principal = index === 0
  const hook = principal ? (project.featuredContent?.hook ?? project.summary) : project.summary
  const technologies = principal ? (project.featuredContent?.technologies ?? project.technologies) : project.technologies
  const role = principal ? project.featuredContent?.role : undefined
  const placement: CSSProperties = { gridArea: principal ? '1 / 1 / 4 / 2' : `${index} / 2 / ${index + 1} / 3` }
  const openFrom = (event: MouseEvent<HTMLButtonElement>) => open(event.currentTarget.closest<HTMLElement>('[data-project-card]')!)
  return <article className={`project-card ${principal ? 'project-card-main' : 'project-card-small'}`} style={placement} data-project-card={project.id}>
    <ProjectVisual project={project} />
    <div className="project-card-content">
      <div className="project-card-meta"><span>{project.category}</span><span className="project-status">{project.status}</span></div>
      <h3>{project.title}<span aria-hidden="true">.</span></h3>
      <p className="project-card-summary">{hook}</p>
      {role && <p className="project-card-role">{role}</p>}
      {!!technologies?.length && <ul className="tech-list" aria-label={`Technologies de ${project.title}`}>{technologies.slice(0, principal ? 4 : 3).map(tech => <li key={tech}>{tech}</li>)}</ul>}
      {principal ? <button className="project-open" onClick={openFrom}>Voir le projet <ArrowUpRight size={17} /></button> : <button className="project-select" onClick={openFrom} aria-label={`Voir le projet ${project.title}`}><span>Voir le projet</span><ArrowUpRight size={18} /></button>}
    </div>
    <span className="card-index" aria-hidden="true">0{index + 1}</span>
  </article>
}
