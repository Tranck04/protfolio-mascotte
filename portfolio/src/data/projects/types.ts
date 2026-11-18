export type ProjectLink = { github?: string; demo?: string; website?: string }

/** Optional supplied media; layout remains the responsibility of the UI. */
export type ProjectMedia = { src: string; alt: string; caption?: string }

/** Contenu réservé à la carte phare (la grande carte de la galerie principale). */
export type ProjectFeaturedContent = {
  /** Accroche plus développée que le résumé court de la carte standard. */
  hook?: string
  /** Rôle personnel synthétique. */
  role?: string
  /** Trois ou quatre technologies principales à mettre en avant. */
  technologies?: string[]
}

export type Project = {
  id: string
  title: string
  category: string
  status: string
  /** Accroche courte utilisée par la carte standard. */
  summary: string
  featured: boolean
  /** Signature éditoriale courte (optionnelle), affichée dans l'en-tête du détail. */
  signature?: string
  /** Taille de l'équipe, en toutes lettres. */
  team?: string
  featuredContent?: ProjectFeaturedContent
  /** Présentation générale (étude de cas). */
  description?: string
  /** Contexte et problème (étude de cas). */
  problem?: string
  /** Titre optionnel du bloc « problème ». */
  problemTitle?: string
  /** Solution envisagée (étude de cas). */
  solution?: string
  /** Titre optionnel du bloc « solution ». */
  solutionTitle?: string
  /** Réalisations et fonctionnalités (étude de cas). */
  features?: string[]
  /** Libellé optionnel de la section des fonctionnalités/composants. */
  featuresSectionLabel?: string
  /** Titre optionnel de la section des fonctionnalités/composants. */
  featuresSectionTitle?: string
  /** Architecture technique (étude de cas). */
  architecture?: string
  /** Contribution personnelle (étude de cas). */
  contribution?: string
  /** Défis techniques et décisions (étude de cas). */
  challenges?: string[]
  /** Réalisations actuelles, rédigées (étude de cas). */
  achievements?: string
  /** Prochaines étapes (étude de cas). */
  nextSteps?: string[]
  /** Libellé optionnel de la section finale (remplace « ÉTAT ACTUEL & PERSPECTIVES »). */
  finalSectionLabel?: string
  /** Titre optionnel de la section finale (remplace « Aujourd'hui, et la suite. »). */
  finalSectionTitle?: string
  /** Sous-titre optionnel du bloc des réalisations de la section finale. */
  finalCurrentTitle?: string
  /** Résultats (conservé pour compatibilité avec l'ancien modèle). */
  results?: string[]
  technologies?: string[]
  thumbnail?: string
  cover?: string
  captures?: string[]
  architectureDiagram?: ProjectMedia
  gallery?: ProjectMedia[]
  year?: number
  links?: ProjectLink
  /** Vrai uniquement lorsque le dépôt est accessible publiquement sans authentification. */
  githubPublic?: boolean
}
