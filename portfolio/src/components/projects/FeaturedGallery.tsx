import { featuredProjects } from '../../data/projects'
import { ProjectCard } from './ProjectCard'

export function FeaturedGallery({ open }: { open: (id: string, source: HTMLElement) => void }) {
  return <div className="featured-grid" aria-label="Sélection de quatre projets">
    {featuredProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} open={(source) => open(project.id, source)} />)}
  </div>
}
