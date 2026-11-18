import { describe, expect, it } from 'vitest'
import { chronologicalJourney, journeyCategories, journeyEntries, sortJourney } from './journey'

describe('journey content and chronology', () => {
  it('contains exactly the six supplied entries and no invented certification', () => {
    expect(journeyEntries).toHaveLength(6)
    expect(new Set(journeyEntries.map(entry => entry.id)).size).toBe(6)
    expect(journeyEntries.filter(entry => entry.category === 'education')).toHaveLength(2)
    expect(journeyEntries.filter(entry => entry.category === 'experience')).toHaveLength(4)
    expect(journeyEntries.filter(entry => entry.category === 'certification')).toHaveLength(0)
    expect(journeyCategories.certification.label).toBe('Formations et certifications')
    expect(journeyEntries.every(entry => !entry.link)).toBe(true)
  })
  it('sorts overlapping entries by structured start date without mutating content or using display labels', () => {
    expect(chronologicalJourney.map(entry => entry.id)).toEqual(['emlink', 'master-sup2i', 'ecom', 'odc', 'uptodate', 'licence-ulc'])
    const inputs = journeyEntries.map((entry, i) => ({ ...entry, displayPeriod: `Arbitrary ${i}` }))
    expect(sortJourney(inputs).map(entry => entry.id)).toEqual(chronologicalJourney.map(entry => entry.id))
    expect(journeyEntries[0].id).toBe('master-sup2i')
    expect(journeyEntries.find(entry => entry.id === 'licence-ulc')!.startDate).toBe('2021')
    expect(journeyEntries.find(entry => entry.id === 'master-sup2i')!.endDate).toBeUndefined()
  })
})
