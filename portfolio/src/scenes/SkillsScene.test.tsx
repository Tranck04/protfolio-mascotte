// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import { SkillsScene } from './SkillsScene'
import { skillDomains } from '../data/skills'
import { polygonPoints, RADAR, radarValues } from '../components/skills/radarGeometry'
import { SkillDetailPanel } from '../components/skills/SkillDetailPanel'

let root: Root
let host: HTMLDivElement
const openProject = vi.fn()
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  openProject.mockClear()
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
})
afterEach(async () => { await act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
const control = (id: string) => host.querySelector<HTMLButtonElement>(`[data-skill-control="${id}"]`)!
const title = () => host.querySelector('#skill-domain-title')!.textContent
const render = (active = true, reduced = true) => act(() => root.render(<SkillsScene sceneRef={() => {}} active={active} visible={active} reduced={reduced} journey={() => {}} contact={() => {}} openProject={openProject} />))

it('shows a five-axis radar and the Frontend details immediately with its tagline', async () => {
  await render()
  expect(title()).toBe('Développement frontend.')
  expect(control('frontend').getAttribute('aria-pressed')).toBe('true')
  expect(host.querySelectorAll('.radar-grid')).toHaveLength(5)
  expect(host.querySelectorAll('.radar-spoke')).toHaveLength(5)
  expect(host.querySelectorAll('[data-skill-control]')).toHaveLength(5)
  expect(host.textContent).toContain('Construire des interfaces fonctionnelles')
  expect(host.querySelector('.skill-tags')!.textContent).toContain('React')
  expect(host.textContent).toContain('Axes de progression')
  expect(host.textContent).not.toContain('%')
})

it('previews a hovered axis while preserving the committed selection and restores on radar exit', async () => {
  await render()
  await act(() => control('backend').dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })))
  expect(title()).toBe('Développement backend.')
  expect(control('frontend').getAttribute('aria-pressed')).toBe('true')
  await act(() => host.querySelector('.skills-radar')!.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' })))
  expect(title()).toBe('Développement frontend.')
  await act(() => control('data').click())
  await act(() => control('devops').dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })))
  expect(title()).toBe('Outils & environnement.')
  await act(() => host.querySelector('.skills-radar')!.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse' })))
  expect(title()).toBe('Données & analyse.')
  expect(control('data').getAttribute('aria-pressed')).toBe('true')
})

it('supports SVG point selection and keyboard focus, arrow navigation and native buttons', async () => {
  await render()
  await act(() => host.querySelector('[data-radar-domain="architecture"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(control('architecture').getAttribute('aria-pressed')).toBe('true')
  await act(() => control('backend').focus())
  expect(title()).toBe('Développement backend.')
  await act(() => control('backend').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })))
  expect(document.activeElement).toBe(control('data'))
  expect(title()).toBe('Données & analyse.')
  expect(control('architecture').getAttribute('aria-pressed')).toBe('true')
  await act(() => control('data').click())
  expect(control('data').getAttribute('aria-pressed')).toBe('true')
  expect(control('data').tagName).toBe('BUTTON')
})

it('exposes all five qualitative definitions and closes the accessible scale with Escape', async () => {
  await render()
  const details = host.querySelector<HTMLDetailsElement>('.skill-level-legend')!
  await act(() => details.querySelector('summary')!.click())
  expect(details.open).toBe(true)
  expect(details.querySelectorAll('ol > li')).toHaveLength(5)
  expect(details.textContent).toContain('Expertise')
  expect(details.textContent).toContain('Fondamentaux')
  await act(() => details.querySelector('button')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })))
  expect(details.open).toBe(false)
  expect(document.activeElement).toBe(details.querySelector('summary'))
})

it('keeps the scale information inside a small viewport when its trigger is near the top', async () => {
  vi.stubGlobal('innerWidth', 390)
  vi.stubGlobal('innerHeight', 500)
  await render()
  const details = host.querySelector<HTMLDetailsElement>('.skill-level-legend')!
  const summary = details.querySelector('summary')!
  const panel = details.querySelector<HTMLElement>('.skill-scale-content')!
  vi.spyOn(summary, 'getBoundingClientRect').mockReturnValue(new DOMRect(190, 75, 170, 44))
  vi.spyOn(details, 'getBoundingClientRect').mockReturnValue(new DOMRect(190, 75, 170, 44))
  Object.defineProperty(panel, 'scrollHeight', { value: 600 })
  await act(() => { details.open = true; details.dispatchEvent(new Event('toggle')) })
  const x = 190 + parseFloat(panel.style.left)
  const y = 75 + parseFloat(panel.style.top)
  expect(x).toBeGreaterThanOrEqual(16)
  expect(x + parseFloat(panel.style.width)).toBeLessThanOrEqual(374)
  expect(y).toBeGreaterThanOrEqual(16)
  expect(y + parseFloat(panel.style.maxHeight)).toBeLessThanOrEqual(484)
})

it('opens the associated case study from the Frontend panel', async () => {
  await render()
  const button = [...host.querySelectorAll<HTMLButtonElement>('.skill-projects button')].find(button => button.textContent!.includes('ProjectHub'))!
  await act(() => button.click())
  expect(openProject).toHaveBeenCalledWith('projecthub')
})

it('keeps non-catalogue references static and renders the Data groups', async () => {
  await act(() => root.render(<SkillDetailPanel domain={skillDomains.find(domain => domain.id === 'data')!} reduced openProject={openProject} />))
  expect(host.querySelectorAll('.skill-group')).toHaveLength(2)
  expect(host.querySelector('.skill-group h5')!.textContent).toContain('Données applicatives')
  expect(host.querySelectorAll('.skill-projects button')).toHaveLength(2)
  expect(host.textContent).toContain('Travaux académiques')
})

it('retains the explicit domain across visits and clears temporary previews on departure', async () => {
  await render()
  await act(() => control('data').click())
  await act(() => control('backend').dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })))
  expect(title()).toBe('Développement backend.')
  await render(false)
  await render(true)
  expect(title()).toBe('Données & analyse.')
  expect(control('data').getAttribute('aria-pressed')).toBe('true')
})

it('deploys the polygon from the centre and settles correctly when animations are reduced', async () => {
  await render(true, false)
  const shape = host.querySelector('[data-radar-values]')!
  const centre = polygonPoints(Array.from({ length: 5 }, () => ({ x: RADAR.cx, y: RADAR.cy })))
  expect(shape.getAttribute('points')).toBe(centre)
  await act(() => { gsap.globalTimeline.getChildren(false, false, true).forEach(timeline => timeline.progress(1)) })
  expect(shape.getAttribute('points')).toBe(polygonPoints(radarValues([4, 3, 2, 4, 3])))
  await render(true, true)
  expect(shape.getAttribute('points')).toBe(polygonPoints(radarValues([4, 3, 2, 4, 3])))
})
