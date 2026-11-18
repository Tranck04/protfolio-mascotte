import type { Project } from '../../data/projects'

const initials = (title: string) => title
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map(word => word[0]?.toUpperCase() ?? '')
  .join('')

/**
 * Real captures will be added later. Until then, every card and overlay uses a
 * typographic placeholder made only from the project name, category and palette.
 */
export function ProjectVisual({ project }: { project: Project }) {
  const image = project.cover ?? project.thumbnail
  if (image) return <div className="project-visual"><img src={image} alt={`Aperçu de ${project.title}`} loading="lazy" /></div>
  return <div className="project-visual project-placeholder" role="img" aria-label={`Visuel provisoire de ${project.title} — capture à venir`}>
    <span className="placeholder-orbit" aria-hidden="true" />
    <span className="placeholder-mark" aria-hidden="true">{initials(project.title)}</span>
    <div className="placeholder-copy" aria-hidden="true">
      <span className="placeholder-kicker">APERÇU PROVISOIRE</span>
      <strong>{project.title}</strong>
      <span className="placeholder-category">{project.category}</span>
    </div>
  </div>
}
