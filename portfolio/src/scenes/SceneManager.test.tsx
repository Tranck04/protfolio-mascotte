// @vitest-environment happy-dom
import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { SceneManager } from './SceneManager'
// Associations are test fixtures, not claims about the owner's project stacks.
vi.mock('../data/skills', async importOriginal => {
  const actual = await importOriginal<typeof import('../data/skills')>()
  return { ...actual, skillDomains: actual.skillDomains.map(domain => ({ ...domain, projectIds: domain.id === 'frontend' ? ['noven', 'l-animations'] : [] })) }
})
import { backgroundPath, backgroundShapes } from '../components/background/backgroundShapes'

let root: Root
let container: HTMLDivElement
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(132)
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1280)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(800)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 800, 600))
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(async () => {
  await act(() => root.unmount())
  container.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('keeps one Bloub through StrictMode, skipping, themes and motion changes', async () => {
  await act(() => root.render(<StrictMode><SceneManager /></StrictMode>))
  const bloub = container.querySelector('.mascot')!
  const bodyPath = bloub.querySelector('[data-body]')!
  expect(bodyPath.getAttribute('d')).toBeTruthy()
  expect(document.body.style.overflow).toBe('hidden')
  await act(() => container.querySelector<HTMLButtonElement>('.skip-button')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('hero')
  expect(container.querySelector('.mascot')).toBe(bloub)
  expect(document.body.style.overflow).toBe('')
  expect(container.querySelector('#hero')!.getAttribute('aria-hidden')).toBe('false')
  const navigation = document.querySelector('nav')!
  expect(navigation.querySelectorAll('button:disabled')).toHaveLength(0)
  await act(() => navigation.querySelector<HTMLButtonElement>('[aria-label="Activer le thème clair"]')!.click())
  expect(document.documentElement.dataset.theme).toBe('light')
  await act(() => navigation.querySelector<HTMLButtonElement>('[aria-label="Réduire les animations"]')!.click())
  expect(document.documentElement.dataset.motion).toBe('reduced')
  expect(container.querySelector('.mascot')).toBe(bloub)
  await act(() => container.querySelector<HTMLButtonElement>('#hero .button-quiet')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('contact')
  expect(container.querySelector('.contact-email')!.getAttribute('href')).toMatch(/^mailto:tfmukendi@gmail\.com/)
})

it('keeps current card identities and scroll positions through the existing project overlay and both scenes', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  const bloub = container.querySelector('.mascot')
  await act(() => container.querySelector<HTMLButtonElement>('#hero .button-primary')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('projects')
  const identities = [...container.querySelectorAll<HTMLElement>('[data-project-card]')]
  const featured = container.querySelector<HTMLElement>('[data-project-view="featured"] .scene-body')!
  featured.scrollTop = 150
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Voir le projet Career OS"]')!.click())
  identities.forEach(card => expect(container.querySelector(`[data-project-card="${card.dataset.projectCard}"]`)).toBe(card))
  expect(container.querySelector('[role="dialog"]')).not.toBeNull()
  expect(container.querySelector('.projects-views')!.getAttribute('data-projects-view')).toBe('featured')
  expect(container.querySelector('#project-detail-title')!.textContent).toBe('Career OS.')
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  expect(container.querySelector('[role="dialog"]')).toBeNull()
  expect(container.querySelector('.projects-views')!.getAttribute('data-projects-view')).toBe('featured')
  expect(featured.scrollTop).toBe(150)
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Bloub — Retour à l’accueil"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('hero')
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  expect(container.querySelector('.project-card-main')!.getAttribute('data-project-card')).toBe('noven')
  expect(container.querySelector('.mascot')).toBe(bloub)
})

it('retains the secondary gallery and its scroll position when returning from a detail or the Hero', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('.gallery-switch')!.click())
  const archive = container.querySelector<HTMLElement>('[data-project-view="archive"] .scene-body')!
  archive.scrollTop = 275
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Voir le projet Migration AWS"]')!.click())
  expect(container.querySelector('[role="dialog"]')).not.toBeNull()
  expect(container.querySelector('#project-detail-title')!.textContent).toBe('Migration AWS.')
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  expect(container.querySelector('[role="dialog"]')).toBeNull()
  expect(container.querySelector('.projects-views')!.getAttribute('data-projects-view')).toBe('archive')
  expect(archive.scrollTop).toBe(275)
  expect(container.querySelector('main')!.dataset.scene).toBe('projects')
  expect([...document.querySelectorAll('nav button')].map(el => el.getAttribute('aria-label'))).toContain('Bloub — Retour à l’accueil')
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Bloub — Retour à l’accueil"]')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  expect(container.querySelector('.projects-views')!.getAttribute('data-projects-view')).toBe('archive')
  expect(archive.scrollTop).toBe(275)
  expect(document.querySelector('nav [aria-label="Projets"]')!.getAttribute('aria-current')).toBe('step')
  expect(container.querySelectorAll('.mascot')).toHaveLength(1)
})

it('settles an active wheel transition when motion is reduced and leaves navigation usable', async () => {
  await act(() => root.render(<SceneManager />))
  await act(() => container.querySelector<HTMLButtonElement>('.skip-button')!.click())
  const bloub = container.querySelector('.mascot')
  await act(() => container.querySelector('.hero-panel')!.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true })))
  expect(container.querySelector('main')!.dataset.transitioning).toBe('true')
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réduire les animations"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('projects')
  expect(container.querySelector('main')!.dataset.transitioning).toBe('false')
  expect(document.querySelector<HTMLButtonElement>('[aria-label="Bloub — Retour à l’accueil"]')!.disabled).toBe(false)
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Bloub — Retour à l’accueil"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('hero')
  expect(container.querySelector('.mascot')).toBe(bloub)
})

it('keeps the existing project overlay usable after resize and changing motion preferences', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    if (this.hasAttribute('data-project-card')) {
      const index = [...this.parentElement!.children].indexOf(this)
      return index === 0 ? new DOMRect(60, 160, 600, 500) : new DOMRect(700, 160 + (index - 1) * 170, 350, 150)
    }
    return new DOMRect(100, 100, 800, 600)
  })
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réactiver les animations"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Voir le projet ProjectHub"]')!.click())
  expect(container.querySelector('[role="dialog"]')).not.toBeNull()
  await act(() => window.dispatchEvent(new Event('resize')))
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réduire les animations"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  expect(container.querySelector('[role="dialog"]')).toBeNull()
  await act(() => container.querySelector<HTMLButtonElement>('.gallery-switch')!.click())
  expect(container.querySelector('.projects-views')!.getAttribute('data-projects-view')).toBe('archive')
  expect(container.querySelector('[data-project-view="archive"]')!.hasAttribute('inert')).toBe(false)
  await act(() => container.querySelector<HTMLButtonElement>('[data-project-view="archive"] .back-button')!.click())
  expect(container.querySelector('[data-project-view="featured"]')!.hasAttribute('inert')).toBe(false)
  expect(error).not.toHaveBeenCalled()
})

it('immediately exposes the Hero when the system asks for reduced motion', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: true, addEventListener() {}, removeEventListener() {} }))
  await act(() => root.render(<SceneManager />))
  expect(container.querySelector('main')!.dataset.scene).toBe('hero')
  expect(document.body.style.overflow).toBe('')
  expect(container.querySelector('.mascot')).not.toBeNull()
})

it('can replay the unchanged introduction after visiting projects without replacing Bloub or the cards', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  const bloub = container.querySelector<HTMLElement>('.mascot')!
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Voir le projet Career OS"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  const card = container.querySelector('.project-card-main')
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réactiver les animations"]')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Introduction"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('intro')
  expect(bloub.style.zIndex).toBe('2')
  expect(container.querySelector('.mascot')).toBe(bloub)
  await act(() => container.querySelector<HTMLButtonElement>('.skip-button')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réduire les animations"]')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('projects')
  expect(container.querySelector('.project-card-main')).toBe(card)
  expect(container.querySelectorAll('.mascot')).toHaveLength(1)
})

it('navigates to Journey and back with an immobile, persistent Bloub and retained project scroll', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<StrictMode><SceneManager /></StrictMode>))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  const bloub = container.querySelector<HTMLElement>('.mascot')!
  const transform = bloub.style.transform
  const featured = container.querySelector<HTMLElement>('[data-project-view="featured"] .scene-body')!
  featured.scrollTop = 153
  await act(() => featured.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true })))
  expect(container.querySelector('main')!.dataset.scene).toBe('journey')
  expect(document.querySelector('nav [aria-label="Parcours"]')!.getAttribute('aria-current')).toBe('step')
  expect(container.querySelector('.mascot')).toBe(bloub)
  expect(bloub.style.transform).toBe(transform)
  expect(container.querySelector('#journey-panel-title')!.textContent).toBe('Développeur logiciel')
  await act(() => container.querySelector<HTMLButtonElement>('[data-journey-trigger="master-sup2i"]')!.click())
  expect(container.querySelector('#journey-panel-title')!.textContent).toBe('Master en Génie Logiciel')
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('projects')
  expect(featured.scrollTop).toBe(153)
  expect(container.querySelector('.mascot')).toBe(bloub)
  expect(bloub.style.transform).toBe(transform)
})

it('offers direct Journey access from Hero, returns to the main gallery, and keeps Bloub Home working', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  const bloub = container.querySelector('.mascot')
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Parcours"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('journey')
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Bloub — Retour à l’accueil"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('hero')
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('.gallery-switch')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Parcours"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('.journey-return')!.click())
  expect(container.querySelector('.projects-views')!.getAttribute('data-projects-view')).toBe('featured')
  expect(container.querySelector('.mascot')).toBe(bloub)
})

it('navigates Journey to Skills and back while preserving the journey selection, scroll and Bloub', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<StrictMode><SceneManager /></StrictMode>))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Parcours"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[data-journey-trigger="master-sup2i"]')!.click())
  const journey = container.querySelector<HTMLElement>('.journey-panel')!
  journey.scrollTop = 187
  const bloub = container.querySelector<HTMLElement>('.mascot')!
  const transform = bloub.style.transform
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Compétences"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('skills')
  expect(document.querySelector('nav [aria-label="Compétences"]')!.getAttribute('aria-current')).toBe('step')
  expect(container.querySelector('#skill-domain-title')!.textContent).toBe('Frontend.')
  expect(container.querySelector('.mascot')).toBe(bloub)
  expect(bloub.style.transform).toBe(transform)
  await act(() => container.querySelector<HTMLButtonElement>('[data-skill-control="data"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('.skills-bottom > button')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('journey')
  expect(container.querySelector('#journey-panel-title')!.textContent).toBe('Master en Génie Logiciel')
  expect(journey.scrollTop).toBe(187)
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Compétences"]')!.click())
  expect(container.querySelector('#skill-domain-title')!.textContent).toBe('Data.')
  expect(container.querySelectorAll('.mascot')).toHaveLength(1)
  expect(document.querySelector<HTMLButtonElement>('nav [aria-label="Contact"]')!.disabled).toBe(false)
})

it('opens the existing project overlay from Skills and returns to the committed domain on close', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Compétences"]')!.click())
  const bloub = container.querySelector('.mascot')
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Consulter Noven depuis les compétences"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('projects')
  expect(container.querySelectorAll('.project-overlay [role="dialog"]')).toHaveLength(1)
  expect(container.querySelector('#project-detail-title')!.textContent).toBe('Noven.')
  expect(document.querySelector('nav [aria-label="Projets"]')!.getAttribute('aria-current')).toBe('step')
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('skills')
  expect(container.querySelector('[role="dialog"]')).toBeNull()
  expect(container.querySelector<HTMLButtonElement>('[data-skill-control="frontend"]')!.getAttribute('aria-pressed')).toBe('true')
  expect(container.querySelector('.mascot')).toBe(bloub)
})

it('resolves a secondary project through the same overlay and releases the scene lock on return', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Compétences"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Consulter L° Animations depuis les compétences"]')!.click())
  expect(container.querySelector('.projects-views')!.getAttribute('data-projects-view')).toBe('archive')
  expect(container.querySelector('#project-detail-title')!.textContent).toBe('L° Animations.')
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('skills')
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Parcours"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('journey')
})

it('opens a requested project after an interrupted motion transition has settled', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Compétences"]')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réactiver les animations"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Consulter Noven depuis les compétences"]')!.click())
  expect(container.querySelector('main')!.dataset.transitioning).toBe('true')
  expect(container.querySelector('[role="dialog"]')).toBeNull()
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réduire les animations"]')!.click())
  expect(container.querySelector('main')!.dataset.transitioning).toBe('false')
  expect(container.querySelector('#project-detail-title')!.textContent).toBe('Noven.')
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('skills')
  expect(error).not.toHaveBeenCalled()
})

it('opens Contact after Skills, frees the Home icon and preserves the single mascot on return', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<StrictMode><SceneManager /></StrictMode>))
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Compétences"]')!.click())
  const bloub = container.querySelector<HTMLElement>('.mascot')!
  const docked = bloub.style.transform
  await act(() => container.querySelector('.skills-panel')!.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true })))
  expect(container.querySelector('main')!.dataset.scene).toBe('contact')
  expect(document.querySelector('nav [aria-label="Contact"]')!.getAttribute('aria-current')).toBe('step')
  expect(document.querySelector<HTMLButtonElement>('nav [data-home-slot]')!.getAttribute('aria-label')).toBe('Accueil')
  expect(bloub.style.transform).not.toBe(docked)
  expect(container.querySelector('.mascot')).toBe(bloub)
  expect(container.querySelector('form, textarea')).toBeNull()
  expect(container.querySelector('.contact-email')!.getAttribute('href')).toMatch(/^mailto:/)
  await act(() => container.querySelector<HTMLButtonElement>('.contact-footer button')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('skills')
  expect(bloub.style.transform).toBe(docked)
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Contact"]')!.click())
  expect(container.querySelector('.contact-email')).not.toBeNull()
  expect(container.querySelector('.contact-confirmation')).toBeNull()
})
it('keeps direct Contact exits and Return to beginning functional without reloading or replacing Bloub', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  const bloub = container.querySelector('.mascot')
  for (const label of ['Projets', 'Parcours', 'Compétences']) {
    await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Contact"]')!.click())
    await act(() => document.querySelector<HTMLButtonElement>(`nav [aria-label="${label}"]`)!.click())
    expect(document.querySelector('[aria-label="Bloub — Retour à l’accueil"]')).not.toBeNull()
    expect(container.querySelector('.mascot')).toBe(bloub)
  }
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Contact"]')!.click())
  expect(container.querySelector('.contact-footer')!.textContent).toContain(String(new Date().getFullYear()))
  expect(container.querySelector('.contact-footer')!.textContent).toContain('Tracy Franck Mukendi')
  await act(() => container.querySelector<HTMLButtonElement>('.contact-footer button:last-child')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('hero')
  expect(container.querySelector('.mascot')).toBe(bloub)
  expect(container.querySelectorAll('.mascot')).toHaveLength(1)
})
it('settles Contact travel when reduced motion interrupts it and keeps email accessible', async () => {
  await act(() => root.render(<SceneManager />))
  await act(() => container.querySelector<HTMLButtonElement>('.skip-button')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Contact"]')!.click())
  expect(container.querySelector('main')!.dataset.transitioning).toBe('true')
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réduire les animations"]')!.click())
  expect(container.querySelector('main')!.dataset.scene).toBe('contact')
  expect(container.querySelector('main')!.dataset.transitioning).toBe('false')
  expect(container.querySelector('form')).toBeNull()
  expect(container.querySelector('.contact-confirmation')).toBeNull()
  expect(document.querySelector<HTMLButtonElement>('nav [aria-label="Accueil"]')!.disabled).toBe(false)
})

it('keeps headers and footers outside the central scrollers, including the centered Contact content', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  for (const name of ['projects', 'journey', 'skills', 'contact']) {
    const shell = container.querySelector(`.${name}-shell`)!
    const body = shell.querySelector('.scene-body')!
    expect(body.hasAttribute('data-scene-scroll')).toBe(true)
    expect(body.contains(shell.firstElementChild)).toBe(false)
    const footer = shell.querySelector('.projects-footer, .journey-bottom, .skills-bottom, .contact-footer')!
    expect(footer.parentElement).toBe(shell)
    expect(body.contains(footer)).toBe(false)
  }
  expect(container.querySelector('.contact-content > .contact-heading')).not.toBeNull()
  expect(container.querySelector('.contact-content > .contact-actions')).not.toBeNull()
  expect(container.querySelector('.hero-grid')!.hasAttribute('data-scene-scroll')).toBe(true)
})

it('keeps one decorative background across all scenes, themes and project overlays', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<StrictMode><SceneManager /></StrictMode>))
  const background = container.querySelector('.morphing-background')!
  const path = background.querySelector('[data-background-contour]')!
  const bloub = container.querySelector('.mascot')!
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.circle))
  for (const [label, shape] of [['Projets', 'squircle'], ['Parcours', 'triangle'], ['Compétences', 'hexagon'], ['Contact', 'cloud'], ['Accueil', 'circle']] as const) {
    const selector = label === 'Accueil' ? 'nav [data-home-slot]' : `nav [aria-label="${label}"]`
    await act(() => document.querySelector<HTMLButtonElement>(selector)!.click())
    expect(container.querySelector('.morphing-background')).toBe(background)
    expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes[shape]))
    expect(container.querySelector('.mascot')).toBe(bloub)
  }
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Activer le thème clair"]')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Projets"]')!.click())
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Voir le projet Career OS"]')!.click())
  expect(container.querySelector('[role="dialog"]')).not.toBeNull()
  expect(container.querySelector('.morphing-background')).toBe(background)
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.squircle))
  await act(() => container.querySelector<HTMLButtonElement>('[aria-label="Fermer le projet"]')!.click())
  expect(container.querySelectorAll('.morphing-background')).toHaveLength(1)
  expect(background.getAttribute('aria-hidden')).toBe('true')
})

it('retains the background when replaying the introduction and settles its circle when skipped', async () => {
  localStorage.setItem('portfolio-motion', 'reduced')
  await act(() => root.render(<SceneManager />))
  const background = container.querySelector('.morphing-background')!
  const path = background.querySelector('[data-background-contour]')!
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Compétences"]')!.click())
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.hexagon))
  await act(() => document.querySelector<HTMLButtonElement>('[aria-label="Réactiver les animations"]')!.click())
  await act(() => document.querySelector<HTMLButtonElement>('nav [aria-label="Introduction"]')!.click())
  expect(container.querySelector('.morphing-background')).toBe(background)
  await act(() => container.querySelector<HTMLButtonElement>('.skip-button')!.click())
  expect(path.getAttribute('d')).toBe(backgroundPath(backgroundShapes.circle))
})

