import { expect, it } from 'vitest'
import { resolveSkillProjects, skillDomains, skillLevels, SKILL_LEVELS_PROVISIONAL } from './skills'
import { projectById } from './projects'

it('defines the five requested families and explicit provisional qualitative levels', () => {
  expect(skillDomains.map(domain => domain.name)).toEqual(['Frontend', 'Backend', 'Data', 'Architecture logicielle', 'Outils & DevOps'])
  expect(skillDomains.map(domain => domain.level)).toEqual([4, 3, 2, 3, 3])
  expect(Object.values(skillLevels).map(level => level.label)).toEqual(['Découverte', 'Initiation', 'Pratique', 'Avancé', 'Expertise'])
  expect(SKILL_LEVELS_PROVISIONAL).toBe(true)
  expect(skillDomains.every(domain => domain.experience === undefined)).toBe(true)
  expect(skillDomains.every(domain => domain.description && domain.technologies.length >= 4)).toBe(true)
})

it('leaves project associations empty until the real stacks are confirmed', () => {
  expect(skillDomains.every(domain => domain.projectIds.length === 0)).toBe(true)
  expect(resolveSkillProjects(skillDomains[0])).toEqual([])
  expect(resolveSkillProjects({ ...skillDomains[0], projectIds: ['missing', 'noven', 'noven'] })).toEqual([projectById.get('noven')])
})
