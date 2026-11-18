import { projectById } from './projects'
import type { Project } from './projects'

export type SkillLevel = 1 | 2 | 3 | 4 | 5
export type SkillDomain = {
  id: string
  name: string
  level: SkillLevel
  description: string
  technologies: string[]
  experience?: string
  projectIds: string[]
}

export const skillLevels: Record<SkillLevel, { label: string; description: string }> = {
  1: { label: 'Découverte', description: 'Notions fondamentales.' },
  2: { label: 'Initiation', description: 'Réalisation de tâches simples avec accompagnement ou documentation.' },
  3: { label: 'Pratique', description: 'Autonomie sur des tâches courantes.' },
  4: { label: 'Avancé', description: 'Réalisation autonome de fonctionnalités ou systèmes complexes.' },
  5: { label: 'Expertise', description: 'Maîtrise approfondie, capacité à guider et à résoudre des problèmes difficiles.' },
}

/** PROVISIONAL: these five demonstration levels must be validated by the portfolio owner.
 * Technology lists are initial content to personalise, not verified mastery claims.
 * No years of practice have been supplied. Project references stay empty until the real
 * stacks of the new project catalogue are confirmed.
 */
export const SKILL_LEVELS_PROVISIONAL = true
export const skillDomains: SkillDomain[] = [
  { id: 'frontend', name: 'Frontend', level: 4,
    description: 'Donner une forme claire aux idées : des interfaces lisibles, des interactions soignées et une attention portée aux personnes qui les utilisent.',
    technologies: ['React', 'TypeScript', 'JavaScript', 'Angular', 'HTML / CSS'],
    projectIds: [],
  },
  { id: 'backend', name: 'Backend', level: 3,
    description: 'Organiser la logique applicative et les échanges de données. Des services compréhensibles, des responsabilités distinctes et des API pensées pour leurs usages.',
    technologies: ['Node.js', 'Python', 'Java', 'Spring Boot', 'APIs REST'], projectIds: [],
  },
  { id: 'data', name: 'Data', level: 2,
    description: 'Structurer, interroger et transformer les données pour rendre les informations utiles et les traitements plus faciles à comprendre.',
    technologies: ['SQL', 'PostgreSQL', 'MongoDB', 'Pandas'], projectIds: [],
  },
  { id: 'architecture', name: 'Architecture logicielle', level: 3,
    description: 'Relier les besoins aux choix techniques. Réfléchir aux frontières d’un système, à ses modules et à la façon dont ils communiquent.',
    technologies: ['DDD', 'Architecture modulaire', 'Event-driven architecture', 'Conception d’API'], projectIds: [],
  },
  { id: 'devops', name: 'Outils & DevOps', level: 3,
    description: 'Faciliter le passage du code à une application utilisable. Des outils pour versionner, construire et préparer des livraisons reproductibles.',
    technologies: ['Git', 'Docker', 'Vite', 'CI/CD'], projectIds: [],
  },
]

/** Resolve existing identities only; missing or duplicated references never create dead links. */
export function resolveSkillProjects(domain: SkillDomain, catalog: ReadonlyMap<string, Project> = projectById): Project[] {
  return [...new Set(domain.projectIds)].flatMap(id => {
    const project = catalog.get(id)
    return project ? [project] : []
  })
}

