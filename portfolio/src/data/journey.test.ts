import { describe, expect, it } from 'vitest'
import { chronologicalJourney, journeyCategories, journeyEntries, sortJourney } from './journey'

describe('journey content and chronology', () => {
  it('contains the seven entries across four categories, without certification claims', () => {
    expect(journeyEntries).toHaveLength(7)
    expect(new Set(journeyEntries.map(entry => entry.id)).size).toBe(7)
    expect(journeyEntries.filter(entry => entry.category === 'education')).toHaveLength(2)
    expect(journeyEntries.filter(entry => entry.category === 'experience')).toHaveLength(3)
    expect(journeyEntries.filter(entry => entry.category === 'certification')).toHaveLength(1)
    expect(journeyEntries.filter(entry => entry.category === 'leadership')).toHaveLength(1)
    expect(journeyCategories.certification.label).toBe('Formation technique')
    expect(journeyCategories.leadership.shortLabel).toBe('Leadership')
    expect(journeyEntries.every(entry => !entry.link)).toBe(true)
  })

  it('sorts overlapping entries by structured start date without mutating content', () => {
    expect(chronologicalJourney.map(entry => entry.id)).toEqual(['emlink', 'master-sup2i', 'ecom', 'odc', 'gdsc', 'uptodate', 'licence-ulc'])
    const inputs = journeyEntries.map((entry, i) => ({ ...entry, displayPeriod: `Arbitrary ${i}` }))
    expect(sortJourney(inputs).map(entry => entry.id)).toEqual(chronologicalJourney.map(entry => entry.id))
    expect(journeyEntries.find(entry => entry.id === 'licence-ulc')!.startDate).toBe('2021')
    expect(journeyEntries.find(entry => entry.id === 'master-sup2i')!.endDate).toBeUndefined()
  })

  it('links experiences to their case studies and reflects the corrected titles', () => {
    expect(journeyEntries.find(entry => entry.id === 'emlink')?.title).toBe('Développeur full-stack')
    expect(journeyEntries.find(entry => entry.id === 'emlink')?.projectId).toBe('projecthub')
    expect(journeyEntries.find(entry => entry.id === 'odc')?.title).toBe('Programme AWS re/Start')
    expect(journeyEntries.find(entry => entry.id === 'odc')?.projectId).toBe('migration-aws')
    expect(journeyEntries.find(entry => entry.id === 'licence-ulc')?.projectId).toBe('migration-aws')
    expect(journeyEntries.find(entry => entry.id === 'gdsc')?.organization).toContain('Google Developer Student Clubs')
  })
})
