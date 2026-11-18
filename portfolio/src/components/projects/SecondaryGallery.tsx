import { ArrowUpRight } from 'lucide-react'
import { secondaryProjects } from '../../data/projects'
import { ProjectVisual } from './ProjectVisual'

export function SecondaryGallery({ open }: { open: (id: string, source: HTMLElement) => void }) {
  return <div className="secondary-grid">{secondaryProjects.map(project => <article className="secondary-card" key={project.id} data-project-card={project.id}>
    <ProjectVisual project={project} />
    <div className="secondary-card-body"><div className="project-card-meta"><span>{project.category}</span><span className="project-status">{project.status}</span></div><h3>{project.title}</h3><p>{project.summary}</p>{!!project.technologies?.length && <ul className="tech-list">{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul>}<button className="project-open" onClick={event => open(project.id, event.currentTarget.closest<HTMLElement>('[data-project-card]')!)} aria-label={`Voir le projet ${project.title}`}>Voir le projet <ArrowUpRight size={16} /></button></div>
  </article>)}</div>
}
