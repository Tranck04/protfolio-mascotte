export type JourneyCategory = 'education' | 'experience' | 'certification' | 'leadership'
/** Dates retain their supplied precision: YYYY or YYYY-MM, independently of display labels. */
export type JourneyEntry = {
  id: string
  title: string
  category: JourneyCategory
  /** Type de contrat ou de cursus (ex. « CDD à temps partiel », « Master — en cours »). */
  typeLabel?: string
  organization: string
  startDate: string
  endDate?: string
  displayPeriod: string
  location?: string
  /** Mode de travail (ex. « À distance »). */
  mode?: string
  description?: string
  /** Responsabilités et réalisations principales. */
  highlights?: string[]
  /** Exemple concret, lorsqu'un cas documenté existe. */
  example?: string
  technologies?: string[]
  /** Compétences développées, notamment pour les expériences non techniques. */
  skills?: string[]
  /** Courte indication de résultat, sans métrique inventée. */
  result?: string
  /** Identifiant du projet associé dans le catalogue des projets. */
  projectId?: string
  link?: string
}

export const journeyCategories: Record<JourneyCategory, { label: string; shortLabel: string }> = {
  education: { label: 'Études et diplômes', shortLabel: 'Études' },
  experience: { label: 'Expériences professionnelles', shortLabel: 'Expérience' },
  certification: { label: 'Formation technique', shortLabel: 'Formation' },
  leadership: { label: 'Leadership et communauté', shortLabel: 'Leadership' },
}

export const journeyEntries: JourneyEntry[] = [
  {
    id: 'emlink',
    title: 'Développeur full-stack',
    category: 'experience',
    typeLabel: 'CDD à temps partiel',
    organization: 'EMLink',
    startDate: '2026-02',
    endDate: '2026-06',
    displayPeriod: 'Février — juin 2026',
    location: 'À distance',
    description: "Au sein d'EMLink, j'ai pris en charge l'essentiel de la conception technique et du développement de ProjectHub, une plateforme de gestion de projets et de ressources.\n\nÀ partir d'une première base d'interface réalisée avec Figma Make, j'ai développé le backend de l'application et réalisé une refonte de son frontend.",
    highlights: [
      "Conception de l'architecture applicative sous la supervision d'un responsable technique.",
      "Implémentation du backend de ProjectHub et de ses fonctionnalités métier.",
      'Refonte du frontend initial avec React et TypeScript.',
      'Développement des modules de gestion de projets, tâches, équipes, permissions, temps, budgets, ressources, documentation et localisation.',
      "Intégration de fonctionnalités d'assistance par agent IA.",
      "Collaboration avec un superviseur chargé d'évaluer mon travail et un ingénieur DevOps responsable de la CI/CD.",
    ],
    technologies: ['React', 'TypeScript', 'Vite', 'Python', 'REST APIs', 'Docker', 'Nginx', 'AWS EC2', 'Firebase Authentication'],
    result: "Développement d'une plateforme métier full-stack fonctionnelle, restée en phase de développement.",
    projectId: 'projecthub',
  },
  {
    id: 'master-sup2i',
    title: 'Master en Génie Logiciel',
    category: 'education',
    typeLabel: 'Master',
    organization: 'SUP2I',
    startDate: '2025-11',
    displayPeriod: 'Depuis novembre 2025',
    location: 'Casablanca',
    description: "Cursus orienté génie logiciel, conception d'applications, architecture et développement.",
  },
  {
    id: 'ecom',
    title: 'Développeur logiciel — Intégration de paiements',
    category: 'experience',
    organization: 'e-Com SAS',
    startDate: '2024-11',
    endDate: '2025-01',
    displayPeriod: 'Novembre 2024 — janvier 2025',
    mode: 'Stage',
    location: 'Kinshasa',
    description: "Au sein de l'équipe technique d'e-Com SAS, j'ai participé à l'accompagnement de développeurs intégrant EasyPay dans leurs plateformes e-commerce.\n\nJ'ai personnellement assuré le suivi technique de trois clients, en intervenant sur les problèmes d'intégration, la configuration des requêtes API et le traitement des réponses de la passerelle de paiement.",
    highlights: [
      'Assistance aux développeurs intégrant le module de paiement EasyPay.',
      "Diagnostic de problèmes liés aux URL d'API, aux environnements sandbox et aux paramètres d'authentification.",
      'Accompagnement de la configuration des callbacks IPN et du traitement des statuts de transaction.',
      'Proposition de corrections pour la redirection vers la passerelle de paiement.',
      'Analyse des réponses API et distinction entre initialisation et confirmation d’un paiement.',
      "Suivi technique de trois clients en collaboration avec l'équipe.",
    ],
    example: "Lors de l'intégration d'EasyPay dans une application utilisant Node.js et Axios, j'ai accompagné un développeur confronté à des erreurs de requête et à l'absence de redirection vers la page de paiement.\n\nAprès avoir examiné la construction de ses requêtes, j'ai proposé des corrections de configuration et de traitement de la référence de transaction. Le client a confirmé que le parcours fonctionnait.",
    technologies: ['PHP', 'FuelPHP', 'API de paiement', 'HTTP/REST', 'Callbacks IPN'],
    result: "Suivi technique de trois intégrations clientes, avec notamment un cas de déblocage confirmé d'un parcours de paiement.",
  },
  {
    id: 'odc',
    title: 'Programme AWS re/Start',
    category: 'certification',
    organization: 'Orange Digital Center',
    startDate: '2024-01',
    endDate: '2024-04',
    displayPeriod: 'Janvier — avril 2024',
    location: 'Kinshasa',
    description: "J'ai suivi le programme AWS re/Start, un parcours de formation technique en cloud computing couvrant les fondamentaux des infrastructures cloud, des services AWS, des réseaux et de la sécurité.\n\nCette expérience a directement inspiré mon projet de licence consacré à la migration de l'infrastructure informatique de l'ULC-ICAM vers AWS.",
    skills: ['Fondamentaux du cloud computing', 'Services AWS', 'Architecture cloud', 'Réseaux et infrastructures', 'Sécurité des environnements cloud'],
    projectId: 'migration-aws',
  },
  {
    id: 'gdsc',
    title: 'Community Lead',
    category: 'leadership',
    organization: 'Google Developer Student Clubs — ULC-ICAM',
    startDate: '2023-09',
    endDate: '2024-08',
    displayPeriod: 'Septembre 2023 — août 2024',
    mode: 'Club étudiant',
    location: 'Kinshasa',
    description: "En tant que Community Lead du Google Developer Student Club de l'ULC-ICAM, j'ai animé une communauté universitaire d'environ 100 membres avec une équipe d'organisation de cinq personnes.\n\nJ'ai contribué à promouvoir l'apprentissage collaboratif, l'innovation technologique et la participation des étudiants à des initiatives de développement logiciel.",
    highlights: [
      "Animation d'une communauté d'environ 100 membres.",
      "Coordination d'une équipe d'organisation de cinq personnes.",
      "Organisation de hackathons et d'activités techniques.",
      "Organisation d'un talk réunissant des femmes ingénieures à l'occasion de la Journée internationale des droits des femmes.",
      "Accompagnement de l'intégration de la communauté au Google Solution Challenge.",
    ],
    skills: ['Leadership', 'Coordination d’équipe', 'Organisation d’événements', 'Communication technique', 'Animation de communauté'],
    result: "Animation d'une communauté universitaire d'environ 100 membres avec une équipe de cinq organisateurs.",
  },
  {
    id: 'uptodate',
    title: 'Développeur frontend stagiaire',
    category: 'experience',
    organization: 'UpToDate Developers',
    startDate: '2023-04',
    endDate: '2023-06',
    displayPeriod: 'Avril — juin 2023',
    mode: 'Stage',
    location: 'À distance',
    description: "J'ai réalisé une landing page d'application web à partir d'une maquette fournie, en utilisant HTML, CSS et JavaScript vanilla.\n\nCette expérience a constitué l'une de mes premières mises en pratique du développement d'interfaces dans un contexte professionnel.",
    highlights: [
      "Traduction d'une maquette en interface web.",
      'Implémentation de la structure HTML et des styles CSS.',
      'Ajout des comportements nécessaires avec JavaScript vanilla.',
      'Ajustement du rendu visuel.',
    ],
    technologies: ['HTML', 'CSS', 'JavaScript'],
    result: "Réalisation d'une landing page à partir d'une maquette.",
  },
  {
    id: 'licence-ulc',
    title: 'Licence en Génie Informatique',
    category: 'education',
    typeLabel: 'Licence',
    organization: 'Université Loyola du Congo — ULC-ICAM',
    startDate: '2021',
    endDate: '2024',
    displayPeriod: '2021 — 2024',
    location: 'Kinshasa',
    description: "Formation universitaire en génie informatique, couvrant le développement logiciel, les systèmes informatiques et les fondamentaux de l'ingénierie.\n\nMon projet de fin de licence portait sur la migration de l'infrastructure informatique de l'université vers AWS.",
    projectId: 'migration-aws',
  },
]

function dateOrder(date: string): number {
  const match = /^(\d{4})(?:-(0[1-9]|1[0-2]))?$/.exec(date)
  if (!match) throw new Error(`Date de parcours invalide : ${date}`)
  return Number(match[1]) * 12 + Number(match[2] ?? 0)
}

export function sortJourney(entries: readonly JourneyEntry[]): JourneyEntry[] {
  return [...entries].sort((a, b) => dateOrder(b.startDate) - dateOrder(a.startDate))
}
export const chronologicalJourney = sortJourney(journeyEntries)
