/**
 * Module de compatibilité : le catalogue vit désormais dans `src/data/projects/`.
 * Ce fichier ne fait que réexporter l'API publique, sans dupliquer de données.
 */
export type { Project, ProjectLink, ProjectFeaturedContent, ProjectMedia } from './projects/types'
export { projects, featuredProjects, secondaryProjects, projectById } from './projects/index'
