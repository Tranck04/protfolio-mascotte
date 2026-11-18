import { expect, it } from 'vitest'
import { resolveSkillReferenceTitle, skillDomains, skillLevels } from './skills'
import { projectById } from './projects'

it('defines the five domains with their corrected autonomy levels', () => {
  expect(skillDomains.map(domain => domain.name)).toEqual(['Backend', 'Frontend', 'Data', 'Architecture logicielle', 'Outils & DevOps'])
  expect(skillDomains.map(domain => domain.level)).toEqual([4, 3, 2, 4, 3])
  expect(Object.values(skillLevels).map(level => level.label)).toEqual(['Découverte', 'Fondamentaux', 'Pratique', 'Avancé', 'Expertise'])
  expect(skillDomains.every(domain => domain.title && domain.tagline && domain.description)).toBe(true)
  expect(skillDomains.every(domain => domain.projectReferences.length > 0 && domain.growthAreas.length > 0)).toBe(true)
})

it('links catalogue references to real projects and keeps non-catalogue references without ids', () => {
  const backend = skillDomains.find(domain => domain.id === 'backend')!
  const ids = backend.projectReferences.map(reference => reference.projectId).filter(Boolean)
  expect(ids).toContain('projecthub')
  expect(ids).toContain('lifehub')
  expect(ids).toContain('noven')
  expect(backend.projectReferences.some(reference => reference.title === 'e-Com SAS' && !reference.projectId)).toBe(true)
  expect(resolveSkillReferenceTitle({ projectId: 'projecthub', description: '' })).toBe(projectById.get('projecthub')!.title)
  expect(resolveSkillReferenceTitle({ title: 'Travaux académiques', description: '' })).toBe('Travaux académiques')
})

it('separates academic data tools from professional data skills', () => {
  const data = skillDomains.find(domain => domain.id === 'data')!
  expect(data.skillGroups).toHaveLength(2)
  expect(data.skillGroups![0].label).toContain('Données applicatives')
  expect(data.skillGroups![1].label).toContain('académique')
  expect(data.skills).toEqual([])
})
