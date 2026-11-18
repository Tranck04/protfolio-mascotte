import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../../data/projects'
import { ProjectVisual } from './ProjectVisual'

const labels: Record<string, string> = { github: 'Dépôt GitHub', demo: 'Démonstration', website: 'Site web' }

export function ProjectDetail({ project }: { project: Project }) {
  const publicLinks = Object.entries(project.links ?? {}).filter(([type, href]) =>
    !!href && /^https:\/\//.test(href) && (type !== 'github' || project.githubPublic === true),
  )
  const hasPrivateGithub = !!project.links?.github && project.githubPublic !== true
  const hasStory = !!(project.description || project.problem || project.solution || project.features?.length)
  return <>
    <div className="detail-heading"><div><p className="project-card-meta"><span>{project.category}</span><span>—</span><span>{project.status}</span></p><h2 id="project-detail-title" tabIndex={-1}>{project.title}<em>.</em></h2><p>{project.summary}</p></div></div>
    <div className="detail-cover"><ProjectVisual project={project} /></div>
    <div className="detail-body"><div className="detail-story">
      {project.description ? <p className="detail-description">{project.description}</p> : !hasStory ? <p className="detail-placeholder">Présentation détaillée à venir.</p> : null}
      {(project.problem || project.solution) && <div className="detail-challenges">
        {project.problem && <section><span>01 — LE PROBLÈME</span><h3>Le point de départ.</h3><p>{project.problem}</p></section>}
        {project.solution && <section><span>02 — LA SOLUTION</span><h3>Une réponse simple.</h3><p>{project.solution}</p></section>}
      </div>}
    </div><aside className="detail-facts">
      {!!project.features?.length && <><h3>Dans ce projet</h3><ul className="feature-list">{project.features.map(feature => <li key={feature}>{feature}</li>)}</ul></>}
      {!!project.technologies?.length && <><h3>Technologies</h3><ul className="tech-list">{project.technologies.map(tech => <li key={tech}>{tech}</li>)}</ul></>}
      <h3>Explorer</h3>
      {publicLinks.length > 0 && publicLinks.map(([type, href]) => <a className="project-open" key={type} href={href} target="_blank" rel="noopener noreferrer">{labels[type] ?? type} <ArrowUpRight size={16} /></a>)}
      {hasPrivateGithub && <p className="unavailable-links">Dépôt GitHub non accessible publiquement pour le moment.</p>}
      {publicLinks.length === 0 && !hasPrivateGithub && <p className="unavailable-links">Aucun lien public n’est disponible pour le moment.</p>}
    </aside></div>
  </>
}
