import { projectById } from './projects'
import type { Project } from './projects'

export type SkillLevel = 1 | 2 | 3 | 4 | 5

/** Réalisation concrète associée à un domaine de compétences. */
export type SkillProjectReference = {
  /** Identifiant du projet dans le catalogue, lorsqu'une étude de cas dédiée existe. */
  projectId?: string
  /** Titre d'affichage pour les références hors catalogue (expériences, travaux académiques, ce portfolio). */
  title?: string
  /** Compétence concrètement démontrée dans cette réalisation. */
  description: string
}

/** Groupe facultatif de compétences (ex. pratique professionnelle vs académique). */
export type SkillGroup = { label: string; items: string[] }

export type SkillDomain = {
  id: string
  /** Libellé affiché sur le radar. */
  name: string
  /** Titre de la fiche détaillée. */
  title: string
  level: SkillLevel
  tagline: string
  description: string
  skills: string[]
  skillGroups?: SkillGroup[]
  projectReferences: SkillProjectReference[]
  growthAreas: string[]
}

export const skillLevels: Record<SkillLevel, { label: string; description: string }> = {
  1: { label: 'Découverte', description: 'Connaissance des concepts, pratique encore limitée.' },
  2: { label: 'Fondamentaux', description: 'Capacité à réaliser des tâches simples avec documentation ou accompagnement.' },
  3: { label: 'Pratique', description: 'Capacité à développer et résoudre des problèmes courants de manière autonome.' },
  4: { label: 'Avancé', description: 'Capacité à concevoir, intégrer et maintenir des fonctionnalités complexes.' },
  5: { label: 'Expertise', description: "Maîtrise des compromis avancés et capacité à accompagner d'autres développeurs sur le domaine." },
}

export const skillDomains: SkillDomain[] = [
  {
    id: 'backend',
    name: 'Backend',
    title: 'Développement backend',
    level: 4,
    tagline: 'Concevoir la logique métier et les services qui font fonctionner les applications.',
    description: "Le développement backend est l'un de mes principaux domaines de pratique.\n\nJ'ai travaillé sur des API métier, des moteurs de décision, des intégrations de services tiers et des traitements asynchrones.\n\nMon approche privilégie la séparation des responsabilités, la cohérence des traitements et la conception de services maintenables.",
    skills: ['Python', 'FastAPI', 'TypeScript / Node.js', 'PHP / FuelPHP', 'API REST', 'Conception de services métier', 'PostgreSQL / SQLite', 'ORM et persistance', 'JWT / OAuth', 'Traitements asynchrones', 'Workers et files de traitement', "Intégration d'API tierces", 'Callbacks et webhooks'],
    projectReferences: [
      { projectId: 'projecthub', description: "Conception et implémentation du backend d'une plateforme de gestion de projets et de ressources." },
      { projectId: 'lifehub', description: "Développement d'un backend FastAPI intégrant un moteur de scoring, des services métier, la persistance et des connecteurs externes." },
      { projectId: 'noven', description: "Travail sur l'architecture backend TypeScript, les contrats partagés et les mécanismes de traitement asynchrone." },
      { title: 'e-Com SAS', description: 'Assistance technique sur les API de paiement EasyPay, les callbacks IPN et le traitement des transactions.' },
    ],
    growthAreas: ['Performance', 'Sécurité applicative avancée', 'Tests de charge', 'Exploitation de services en production à grande échelle'],
  },
  {
    id: 'frontend',
    name: 'Frontend',
    title: 'Développement frontend',
    level: 3,
    tagline: 'Construire des interfaces fonctionnelles, cohérentes et connectées aux systèmes métier.',
    description: "Je développe des interfaces web interactives, principalement avec React, TypeScript et JavaScript.\n\nMa pratique du frontend est orientée vers l'implémentation des parcours utilisateurs, la cohérence des composants et leur intégration avec la logique applicative.\n\nJ'ai également travaillé sur la refonte d'interfaces existantes et l'intégration de maquettes.",
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML / CSS', 'Vite', 'Tailwind CSS', 'Responsive Design', 'Composants réutilisables', 'Gestion des états', "Intégration d'API REST", 'GSAP', 'SVG et animations d’interface'],
    projectReferences: [
      { projectId: 'projecthub', description: 'Refonte du frontend initial issu de Figma Make et développement des interfaces des modules métier.' },
      { projectId: 'lifehub', description: "Développement de l'application React et de ses parcours de gestion adaptative des tâches." },
      { title: 'Portfolio interactif', description: "Conception et réalisation d'une interface interactive comprenant scènes, transitions, animations et mascotte SVG, avec utilisation d'outils d'assistance au développement." },
      { title: 'UpToDate Developers', description: "Réalisation d'une landing page à partir d'une maquette avec HTML, CSS et JavaScript vanilla." },
    ],
    growthAreas: ['Accessibilité avancée', 'Performance de rendu', "Tests d'interface", 'Systèmes de composants réutilisables'],
  },
  {
    id: 'data',
    name: 'Data',
    title: 'Données & analyse',
    level: 2,
    tagline: "Structurer, interroger et exploiter les données au service des applications et de l'analyse.",
    description: "Je possède une expérience pratique de la persistance et de la manipulation des données dans des applications logicielles.\n\nJ'ai également étudié plusieurs outils d'analyse et de traitement distribué dans le cadre de ma formation.\n\nJe distingue ces acquis académiques de mon expérience professionnelle, principalement orientée développement applicatif.",
    skills: [],
    skillGroups: [
      { label: 'Données applicatives', items: ['SQL', 'PostgreSQL', 'SQLite', 'Modélisation relationnelle', 'ORM', 'Requêtes et persistance'] },
      { label: 'Analyse et traitement — pratique académique', items: ['MongoDB', 'pandas', 'matplotlib', 'Apache Spark', 'Hadoop / HBase', 'Power BI'] },
    ],
    projectReferences: [
      { projectId: 'lifehub', description: "Persistance des données utilisateur et utilisation de l'historique des interactions dans le moteur décisionnel." },
      { projectId: 'noven', description: 'Normalisation, stockage, déduplication et traitement des informations collectées.' },
      { title: 'Travaux académiques', description: 'Exercices de traitement, interrogation et visualisation de données avec plusieurs outils étudiés en formation.' },
    ],
    growthAreas: ['Pipelines ETL', 'Modélisation analytique', 'Orchestration des données', 'Traitement distribué appliqué à des projets concrets'],
  },
  {
    id: 'architecture',
    name: 'Architecture logicielle',
    title: 'Architecture logicielle',
    level: 4,
    tagline: 'Transformer des besoins métier en systèmes cohérents, modulaires et évolutifs.',
    description: "L'architecture logicielle occupe une place centrale dans mon approche du développement.\n\nJe m'intéresse particulièrement à la modélisation du domaine, aux responsabilités des modules, aux contrats entre composants et à la cohérence globale des systèmes.\n\nPlusieurs de mes projets explorent la conception de systèmes dans lesquels les règles métier constituent le cœur de l'application.",
    skills: ['Domain-Driven Design', 'Modélisation métier', 'Entités et relations', 'Architecture modulaire', 'Séparation des responsabilités', "Conception d'API", 'Contrats entre modules', 'Architecture événementielle', 'Repository Pattern', 'Services applicatifs', 'Intégrité des données', 'Évolutivité des systèmes'],
    projectReferences: [
      { projectId: 'projecthub', description: "Conception de l'architecture applicative sous supervision et développement des modules métier." },
      { projectId: 'lifehub', description: "Séparation du moteur décisionnel, des services applicatifs, de l'API et de la persistance." },
      { projectId: 'career-os', description: 'Travaux de modélisation du domaine, des relations entre entités et des règles de cohérence.' },
      { projectId: 'noven', description: 'Définition et évolution de contrats partagés entre modules, avec des composants développés en parallèle.' },
    ],
    growthAreas: ['Architecture distribuée à grande échelle', 'Observabilité', 'Résilience', 'Analyse des compromis architecturaux sur des systèmes exploités en production'],
  },
  {
    id: 'devops',
    name: 'Outils & DevOps',
    title: 'Outils & environnement',
    level: 3,
    tagline: "Organiser, versionner, exécuter et préparer le déploiement d'applications logicielles.",
    description: "J'utilise les outils de développement, de versionnement et de conteneurisation nécessaires à la construction d'applications modernes.\n\nJe possède également des bases en infrastructure cloud et une compréhension des workflows de déploiement.\n\nMon profil reste principalement orienté génie logiciel, plutôt qu'administration d'infrastructures ou spécialisation DevOps.",
    skills: ['Git', 'GitHub', 'Docker', 'Nginx', 'Linux', 'AWS', 'CI/CD — principes et collaboration', 'Render', 'Netlify', 'Gestion des dépendances', 'Environnements de développement', 'VS Code'],
    projectReferences: [
      { projectId: 'projecthub', description: 'Travail dans un environnement de développement conteneurisé et collaboration avec un ingénieur DevOps responsable de la CI/CD.' },
      { projectId: 'lifehub', description: 'Environnements frontend/backend et infrastructure de déploiement documentée.' },
      { projectId: 'migration-aws', description: "Étude de migration d'une infrastructure informatique universitaire vers AWS." },
      { projectId: 'noven', description: "Organisation d'un monorepo TypeScript et collaboration autour des modules du produit." },
    ],
    growthAreas: ['Conception complète de pipelines CI/CD', 'Infrastructure as code', 'Kubernetes', 'Monitoring et exploitation en production'],
  },
]

/** Resolve the display title of a project reference (catalogue title first, then fallback). */
export function resolveSkillReferenceTitle(reference: SkillProjectReference, catalog: ReadonlyMap<string, Project> = projectById): string {
  const project = reference.projectId ? catalog.get(reference.projectId) : undefined
  return project?.title ?? reference.title ?? reference.projectId ?? ''
}
