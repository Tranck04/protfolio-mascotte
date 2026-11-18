export type { Project, ProjectLink, ProjectFeaturedContent, ProjectMedia } from './types'
import { noven } from './noven'
import { projecthub } from './projecthub'
import { lifehub } from './lifehub'
import { careerOs } from './career-os'
import { lAnimations } from './l-animations'
import { migrationAws } from './migration-aws'
import { mtcErp } from './mtc-erp'
import { booknest } from './booknest'
import { playzone } from './playzone'
import { nyumbart } from './nyumbart'

export const projects = [noven, projecthub, lifehub, careerOs, lAnimations, migrationAws, mtcErp, booknest, playzone, nyumbart]
export const featuredProjects = projects.filter(project => project.featured)
export const secondaryProjects = projects.filter(project => !project.featured)
export const projectById = new Map(projects.map(project => [project.id, project]))
