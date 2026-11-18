export type ProjectLink = { github?: string; demo?: string; website?: string }

/**
 * One entry per real project. Optional fields stay empty until the owner supplies
 * verified content for the next sprints; no case study is invented here.
 */
export type Project = {
  id: string
  title: string
  category: string
  status: string
  summary: string
  featured: boolean
  description?: string
  problem?: string
  solution?: string
  contribution?: string
  architecture?: string
  challenges?: string[]
  results?: string[]
  features?: string[]
  technologies?: string[]
  thumbnail?: string
  cover?: string
  captures?: string[]
  year?: number
  links?: ProjectLink
  /** Only true when the repository is publicly reachable without authentication. */
  githubPublic?: boolean
}

export const projects: Project[] = [
  {
    id: 'noven', title: 'Noven', category: 'Veille personnelle intelligente', status: 'En développement', featured: true,
    summary: 'Application de veille personnelle présentée comme un magazine numérique.',
    links: { github: 'https://github.com/Tranck04/Noven' }, githubPublic: false,
  },
  {
    id: 'projecthub', title: 'ProjectHub', category: 'Plateforme de gestion de projets', status: 'Réalisé chez EMLink', featured: true,
    summary: 'Plateforme de gestion de projets et de ressources, réalisée dans un contexte professionnel chez EMLink.',
  },
  {
    id: 'lifehub', title: 'LifeHub', category: 'Assistant adaptatif de gestion des tâches', status: 'En développement', featured: true,
    summary: 'Système d’aide à la décision pour les tâches, selon le contexte et l’énergie de l’utilisateur.',
    links: { github: 'https://github.com/Tranck04/lifehub-concours' }, githubPublic: false,
  },
  {
    id: 'career-os', title: 'Career OS', category: 'Application de gestion de carrière', status: 'Démarrage — code local', featured: true,
    summary: 'Application de gestion de carrière en cours de démarrage ; le code est encore conservé localement.',
  },
  {
    id: 'l-animations', title: 'L° Animations', category: 'Animation SVG et bibliothèque de composants', status: 'Développement entamé', featured: false,
    summary: 'Bibliothèque de composants et d’animations SVG en cours de développement.',
    technologies: ['SVG'], links: { github: 'https://github.com/Tranck04/L0-animations' }, githubPublic: true,
  },
  {
    id: 'migration-aws', title: 'Migration AWS', category: 'Architecture et migration cloud', status: 'Projet académique de licence', featured: false,
    summary: 'Projet académique de licence consacré à l’architecture et à la migration d’une application vers AWS.',
    technologies: ['AWS'],
  },
  {
    id: 'mtc-erp', title: 'MTC ERP', category: 'Application de gestion d’entreprise', status: 'Prototype', featured: false,
    summary: 'Prototype d’application de gestion d’entreprise.',
    links: { github: 'https://github.com/Tranck04/MTC_ERP' }, githubPublic: false,
  },
  {
    id: 'booknest', title: 'BookNest', category: 'Bibliothèque personnelle en ligne', status: 'Projet académique développé', featured: false,
    summary: 'Bibliothèque personnelle en ligne réalisée dans un cadre académique.',
    technologies: ['Django'], links: { github: 'https://github.com/Tranck04/django-booknest-tracy-franck-mukendi' }, githubPublic: true,
  },
  {
    id: 'playzone', title: 'PlayZone', category: 'Plateforme de mise en relation sportive', status: 'Projet de hackathon', featured: false,
    summary: 'Plateforme de mise en relation sportive conçue lors d’un hackathon.',
    links: { github: 'https://github.com/Tranck04/playzone' }, githubPublic: false,
  },
  {
    id: 'nyumbart', title: 'NyumbArt', category: 'Galerie d’art en ligne', status: 'Ancien projet', featured: false,
    summary: 'Galerie d’art en ligne, ancien projet.',
    links: { github: 'https://github.com/Tranck04/NyumbArt' }, githubPublic: true,
  },
]

export const featuredProjects = projects.filter(project => project.featured)
export const secondaryProjects = projects.filter(project => !project.featured)
export const projectById = new Map(projects.map(project => [project.id, project]))
