// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { JourneyScene } from './JourneyScene'

let root: Root
let host: HTMLDivElement
let openProject: (id: string) => void
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('innerWidth', 1280)
  vi.stubGlobal('innerHeight', 800)
  openProject = vi.fn()
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
})
afterEach(async () => {
  await act(() => root.unmount()); host.remove(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals()
})
const trigger = (id: string) => host.querySelector<HTMLButtonElement>(`[data-journey-trigger="${id}"]`)!
const title = () => host.querySelector<HTMLElement>('#journey-panel-title')!.textContent
const render = () => act(() => root.render(<JourneyScene sceneRef={() => {}} active visible reduced projects={() => {}} skills={() => {}} openProject={openProject} />))

it('selects the most recent entry by default and keeps the permanent panel visible', async () => {
  await render()
  expect(host.querySelector('#journey-detail-panel')).not.toBeNull()
  expect(title()).toBe('Développeur full-stack')
  expect(trigger('emlink').getAttribute('aria-pressed')).toBe('true')
  expect([...host.querySelectorAll<HTMLElement>('[data-journey-trigger]')].map(node => node.dataset.journeyTrigger)).toEqual(['emlink', 'master-sup2i', 'ecom', 'odc', 'gdsc', 'uptodate', 'licence-ulc'])
})

it('previews a milestone on hover and restores the selection when leaving the timeline', async () => {
  await render()
  const timeline = host.querySelector<HTMLElement>('.journey-timeline')!
  await act(() => trigger('ecom').dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })))
  expect(title()).toBe('Développeur logiciel — Intégration de paiements')
  expect(trigger('emlink').getAttribute('aria-pressed')).toBe('true')
  await act(() => timeline.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' })))
  expect(title()).toBe('Développeur full-stack')
})

it('commits a durable selection on click and renders the populated sections', async () => {
  await render()
  await act(() => trigger('odc').click())
  expect(trigger('odc').getAttribute('aria-pressed')).toBe('true')
  expect(title()).toBe('Programme AWS re/Start')
  expect(host.querySelector('.journey-detail-location')).not.toBeNull()
  expect(host.querySelector('.journey-detail-description')).not.toBeNull()
  expect(host.querySelector('.journey-section h4')?.textContent).toBe('Compétences')
})

it('opens the associated case study when the link is activated', async () => {
  await render()
  await act(() => trigger('emlink').click())
  const link = host.querySelector<HTMLButtonElement>('.journey-panel-link')
  expect(link?.textContent).toContain('Explorer le projet')
  await act(() => link!.click())
  expect(openProject).toHaveBeenCalledWith('projecthub')
})

it('makes focused milestones consultable and keeps keyboard selection accessible', async () => {
  await render()
  await act(() => trigger('master-sup2i').focus())
  expect(title()).toBe('Master en Génie Logiciel')
  await act(() => trigger('master-sup2i').click())
  expect(trigger('master-sup2i').getAttribute('aria-pressed')).toBe('true')
  expect(title()).toBe('Master en Génie Logiciel')
})
