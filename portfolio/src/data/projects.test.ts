import { describe, expect, it } from 'vitest'
import { featuredProjects, projects, secondaryProjects } from './projects'

describe('central project catalogue', () => {
  it('contains the four featured projects in order and the six secondary projects', () => {
    expect(featuredProjects.map(project => project.id)).toEqual(['noven', 'projecthub', 'lifehub', 'career-os'])
    expect(secondaryProjects.map(project => project.id)).toEqual(['l-animations', 'migration-aws', 'mtc-erp', 'booknest', 'playzone', 'nyumbart'])
    expect(projects).toHaveLength(10)
    expect(new Set(projects.map(project => project.id)).size).toBe(projects.length)
    expect(projects.every(project => project.title && project.category && project.status && project.summary)).toBe(true)
  })

  it('only exposes GitHub actions for repositories that are publicly reachable', () => {
    expect(projects.filter(project => project.githubPublic).map(project => project.id)).toEqual(['l-animations', 'booknest', 'nyumbart'])
    for (const project of projects) {
      if (project.links?.github) expect(typeof project.githubPublic).toBe('boolean')
      if (project.githubPublic) expect(project.links?.github).toMatch(/^https:\/\/github\.com\//)
    }
    expect(projects.find(project => project.id === 'projecthub')?.links).toBeUndefined()
    expect(projects.find(project => project.id === 'career-os')?.links).toBeUndefined()
    expect(projects.find(project => project.id === 'migration-aws')?.links).toBeUndefined()
  })
})
