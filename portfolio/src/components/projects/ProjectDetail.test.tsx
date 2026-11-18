import { afterEach, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProjectDetail } from './ProjectDetail'
import { projects, type Project } from '../../data/projects'
import { noven } from '../../data/projects/noven'

function render(project: Project) {
  const host = document.createElement('div')
  host.innerHTML = renderToStaticMarkup(<ProjectDetail project={project} />)
  document.body.appendChild(host)
  return host
}
afterEach(() => { document.body.innerHTML = '' })

it('retains every Noven paragraph and qualification without a placeholder cover or sidebar', () => {
  const host = render(noven)
  expect(host.querySelector('.detail-cover, .detail-facts, .project-placeholder, img')).toBeNull()
  for (const text of [noven.description, noven.problem, noven.solution, noven.architecture, noven.contribution, noven.achievements]) {
    for (const paragraph of text!.split(/\n\s*\n/)) expect(host.textContent).toContain(paragraph)
  }
  expect(host.querySelector('.study-intro')!.textContent).toContain(noven.team)
  expect(host.querySelector('.study-intro')!.textContent).toContain(noven.featuredContent!.role)
  expect(host.querySelector('.study-links a')).toBeNull()
  expect(host.textContent).toContain('Dépôt GitHub non accessible publiquement')
  expect(host.querySelectorAll('.study-stack li')).toHaveLength(noven.technologies!.length)
  expect(host.querySelectorAll('.study-stack')).toHaveLength(1)
})

it('separates built capabilities, current achievements and future work', () => {
  const host = render(noven)
  const built = host.querySelector('#study-noven-built')!.closest('section')!
  const current = host.querySelector('[data-study-current]')!, next = host.querySelector('[data-study-next]')!
  for (const feature of noven.features!) expect(built.textContent).toContain(feature)
  for (const step of noven.nextSteps!) {
    expect(next.textContent).toContain(step)
    expect(built.textContent).not.toContain(step)
    expect(current.textContent).not.toContain(step)
  }
  expect(current.textContent).toContain('ne sont pas encore livrées')
  expect(built.textContent).toContain('encore en validation')
})

it('renders all ten actual projects without empty section headings or invented content', () => {
  expect(projects).toHaveLength(10)
  for (const project of projects) {
    const host = render(project)
    expect(host.querySelector('#project-detail-title')!.textContent).toBe(`${project.title}.`)
    expect(host.textContent).toContain(project.summary)
    for (const section of host.querySelectorAll('.study-section')) {
      const content = [...section.children].filter(child => !child.classList.contains('study-section-heading'))
      expect(content.some(child => !!child.textContent?.trim() || !!child.querySelector('img'))).toBe(true)
    }
    if (project.id !== 'noven' && !project.architecture && !project.technologies?.length) expect(host.querySelector('.study-architecture')).toBeNull()
    expect(host.querySelector('.study-gallery')).toBeNull()
  }
})

it('hides blank optional sections and keeps a minimal project compact', () => {
  const host = render({ id: 'minimal', title: 'Projet', category: '', status: '', summary: 'Une idée.', featured: false,
    description: ' ', architecture: '\n', contribution: '', features: ['', ' '], challenges: [], nextSteps: [''], technologies: [] })
  expect(host.querySelectorAll('.study-section')).toHaveLength(0)
  expect(host.querySelector('img, aside, .study-links')).toBeNull()
  expect(host.querySelectorAll('dt')).toHaveLength(0)
  expect(host.querySelector('.study-facts')).toBeNull()
})

it('supports a single or odd number of challenges and a one-sided progress section', () => {
  for (const challenges of [['Un défi.'], ['Premier.', 'Deuxième.', 'Troisième.']]) {
    const host = render({ ...projects[1], challenges, nextSteps: ['À construire.'], results: ['Livraison existante.'] })
    expect(host.querySelectorAll('.study-decisions > li')).toHaveLength(challenges.length)
    expect(host.querySelector('[data-study-current]')!.textContent).toContain('Livraison existante.')
  }
  const host = render({ ...projects[1], achievements: undefined, results: undefined, nextSteps: ['À construire.'] })
  expect(host.querySelector('[data-study-current]')).toBeNull()
  expect(host.querySelector('[data-study-next]')).not.toBeNull()
})

it('renders supplied media with descriptions and captions once, preserving legacy captures', () => {
  // Synthetic fixture paths exercise optional rendering; no media is added to the real catalogue.
  const host = render({ ...projects[1], cover: '/cover.png', captures: ['/capture.png', '/cover.png'],
    architectureDiagram: { src: '/diagram.svg', alt: 'Architecture fournie', caption: 'Schéma fourni.' },
    gallery: [{ src: '/screen.png', alt: 'Vue fournie', caption: 'Une légende.' }],
  })
  expect(host.querySelectorAll('img')).toHaveLength(4)
  expect(host.querySelector('img[alt="Architecture fournie"]')).not.toBeNull()
  expect(host.querySelectorAll('figcaption')).toHaveLength(1)
  expect(host.querySelector('.hero-gallery-toggle')).not.toBeNull()
  expect(host.querySelector('#study-projecthub-architecture')!.closest('section')!.querySelector('img')!.getAttribute('src')).toBe('/diagram.svg')
})

it('offers existing public links with accessible external-link names and one deduplicated stack', () => {
  const host = render({ ...projects[1], technologies: ['TypeScript', 'TypeScript'], links: { github: 'https://github.com/example/project', demo: 'https://example.com' }, githubPublic: true })
  expect(host.querySelectorAll('.study-links a')).toHaveLength(2)
  for (const link of host.querySelectorAll('.study-links a')) {
    expect(link.getAttribute('aria-label')).toContain('nouvel onglet')
    expect(link.getAttribute('rel')).toContain('noopener')
  }
  expect(host.querySelectorAll('.study-stack li')).toHaveLength(1)
})
