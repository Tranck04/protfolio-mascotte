export type JourneyCategory = 'education' | 'experience' | 'certification'
/** Dates retain their supplied precision: YYYY or YYYY-MM, independently of display labels. */
export type JourneyEntry = {
  id: string
  title: string
  category: JourneyCategory
  typeLabel?: string
  organization: string
  startDate: string
  endDate?: string
  displayPeriod: string
  location?: string
  description?: string
  highlights?: string[]
  technologies?: string[]
  link?: string
}

export const journeyCategories: Record<JourneyCategory, { label: string; shortLabel: string }> = {
  education: { label: 'Études et diplômes', shortLabel: 'Études' },
  experience: { label: 'Stages et expériences professionnelles', shortLabel: 'Expérience' },
  certification: { label: 'Formations et certifications', shortLabel: 'Formation' },
}

export const journeyEntries: JourneyEntry[] = [
  { id: 'master-sup2i', title: 'Master en Génie Logiciel', category: 'education', typeLabel: 'Master — en cours', organization: 'SUP2I', startDate: '2025-11', displayPeriod: 'Depuis novembre 2025', location: 'Casablanca' },
  { id: 'emlink', title: 'Développeur logiciel', category: 'experience', typeLabel: 'Contrat à temps partiel', organization: 'EMLink', startDate: '2026-02', endDate: '2026-06', displayPeriod: 'Février — juin 2026', location: 'À distance', description: 'Participation au développement de ProjectHub, une plateforme de gestion de projets.' },
  { id: 'licence-ulc', title: 'Licence en Génie Informatique', category: 'education', typeLabel: 'Licence', organization: 'Université Loyola du Congo (ULC-ICAM)', startDate: '2021', endDate: '2024', displayPeriod: '2021 — 2024', location: 'Kinshasa' },
  { id: 'ecom', title: 'Développeur / intégration de paiements', category: 'experience', typeLabel: 'Expérience professionnelle', organization: 'e-Com SAS', startDate: '2024-11', endDate: '2025-01', displayPeriod: 'Novembre 2024 — janvier 2025', description: 'Intégration de passerelles de paiement et maintenance applicative.' },
  { id: 'odc', title: 'Stage Cloud Architect', category: 'experience', typeLabel: 'Stage', organization: 'Orange Digital Center', startDate: '2024-01', endDate: '2024-04', displayPeriod: 'Janvier — avril 2024' },
  { id: 'uptodate', title: 'Stage développeur Frontend', category: 'experience', typeLabel: 'Stage', organization: 'UpToDate Developers', startDate: '2023-04', endDate: '2023-06', displayPeriod: 'Avril — juin 2023' },
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
