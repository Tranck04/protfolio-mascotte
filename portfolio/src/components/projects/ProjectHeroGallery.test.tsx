import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import { ProjectHeroGallery } from './ProjectHeroGallery'
import { ProjectOverlay } from './ProjectOverlay'
import { projects } from '../../data/projects'

// Test-only image references; no invented captures are added to the portfolio.
const gallery = [{ src: '/fixture-one.png', alt: 'Vue générale fournie', caption: 'Première vue.' }, { src: '/fixture-two.png', alt: 'Vue détaillée fournie' }]
let root: Root, host: HTMLDivElement, scroller: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  host = document.createElement('div'); document.body.appendChild(host)
  scroller = document.createElement('div'); scroller.className = 'overlay-scroll'; host.appendChild(scroller)
  Object.defineProperty(scroller, 'clientHeight', { value: 600 })
  root = createRoot(scroller)
})
afterEach(async () => { await act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
const toggle = () => scroller.querySelector<HTMLButtonElement>('.hero-gallery-toggle')!
const hero = () => scroller.querySelector<HTMLElement>('.hero-gallery')!
async function render(images = gallery, reduced = true) { await act(() => root.render(<StrictMode><ProjectHeroGallery title="Projet test" signature="Une signature." gallery={images} reduced={reduced} /></StrictMode>)) }
async function clickToggle() { await act(() => toggle().click()) }
async function navigate(label: string) { await act(() => scroller.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!.click()) }
const currentAlt = () => scroller.querySelector('img[aria-hidden="false"]')?.getAttribute('alt')

it('leaves the editorial title and signature untouched when no images exist', async () => {
  await render([])
  expect(scroller.querySelector('.hero-gallery, button, img')).toBeNull()
  expect(scroller.querySelector('#project-detail-title')!.textContent).toBe('Projet test.')
  expect(scroller.querySelector('.study-signature')!.textContent).toBe('Une signature.')
})
it('opens, grows, moves the title and closes back to its initial geometry', async () => {
  await render()
  const closedHeight = parseFloat(hero().style.height)
  expect(toggle().textContent).toContain('Voir la galerie')
  expect(toggle().getAttribute('aria-expanded')).toBe('false')
  expect(currentAlt()).toBe(gallery[0].alt)
  await clickToggle()
  expect(parseFloat(hero().style.height)).toBeGreaterThan(closedHeight)
  expect(scroller.querySelector<HTMLElement>('.hero-gallery-copy')!.style.transform).not.toBe('translate(0, 0)')
  expect(toggle().textContent).toContain('Fermer la galerie')
  expect(scroller.querySelector<HTMLButtonElement>('[aria-label="Image suivante"]')!.disabled).toBe(false)
  await clickToggle()
  expect(parseFloat(hero().style.height)).toBe(closedHeight)
  expect(scroller.querySelector<HTMLButtonElement>('[aria-label="Image suivante"]')!.disabled).toBe(true)
})
it('cycles in both directions and keeps the title transform stable while images change', async () => {
  await render(); await clickToggle()
  const copy = scroller.querySelector<HTMLElement>('.hero-gallery-copy')!, transform = copy.style.transform
  await navigate('Image suivante'); expect(currentAlt()).toBe(gallery[1].alt)
  await navigate('Image suivante'); expect(currentAlt()).toBe(gallery[0].alt)
  await navigate('Image précédente'); expect(currentAlt()).toBe(gallery[1].alt)
  expect(copy.style.transform).toBe(transform)
  expect(hero().dataset.open).toBe('true')
  await act(() => toggle().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })))
  expect(currentAlt()).toBe(gallery[0].alt)
})
it('omits arrows for one image and remains readable after a loading error', async () => {
  await render([gallery[0]]); await clickToggle()
  expect(scroller.querySelector('.hero-gallery-arrows')).toBeNull()
  await act(() => scroller.querySelector('img')!.dispatchEvent(new Event('error')))
  expect(scroller.querySelector('.hero-gallery-error')!.textContent).toContain('Image indisponible')
  await clickToggle(); expect(hero().dataset.open).toBe('false')
})
it('ignores micro-wheel, upward and horizontal gestures, then closes without preventing native scrolling', async () => {
  await render(); await clickToggle()
  for (const init of [{ deltaY: 1 }, { deltaY: -80 }, { deltaX: 120, deltaY: 10 }]) {
    const event = new WheelEvent('wheel', { ...init, bubbles: true, cancelable: true })
    await act(() => scroller.dispatchEvent(event)); expect(event.defaultPrevented).toBe(false)
  }
  expect(hero().dataset.open).toBe('true')
  const event = new WheelEvent('wheel', { deltaY: 80, bubbles: true, cancelable: true })
  await act(() => scroller.dispatchEvent(event))
  expect(hero().dataset.open).toBe('false'); expect(event.defaultPrevented).toBe(false)
})
it('closes on actual internal downward scrolling while leaving page scrolling keys alone', async () => {
  await render(); await clickToggle()
  const pageDown = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true })
  await act(() => hero().dispatchEvent(pageDown)); expect(pageDown.defaultPrevented).toBe(false)
  await act(() => { scroller.scrollTop = 3; scroller.dispatchEvent(new Event('scroll')) })
  expect(hero().dataset.open).toBe('true')
  await act(() => { scroller.scrollTop = 40; scroller.dispatchEvent(new Event('scroll')) })
  expect(hero().dataset.open).toBe('false')
})
it('uses a vertical touch intention to close, without treating horizontal swipes as image navigation', async () => {
  await render(); await clickToggle()
  const touch = async (type: string, x: number, y: number) => {
    const event = new Event(type, { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'touches', { value: [{ clientX: x, clientY: y }] })
    await act(() => scroller.dispatchEvent(event)); expect(event.defaultPrevented).toBe(false)
  }
  await touch('touchstart', 100, 200); await touch('touchmove', 180, 195)
  expect(hero().dataset.open).toBe('true'); expect(currentAlt()).toBe(gallery[0].alt)
  await touch('touchstart', 100, 200); await touch('touchmove', 100, 130)
  expect(hero().dataset.open).toBe('false')
})
it('interrupts a running animation from its current height and removes listeners on unmount', async () => {
  const remove = vi.spyOn(scroller, 'removeEventListener')
  await render(gallery, false)
  const closed = parseFloat(hero().style.height)
  await clickToggle()
  await act(() => { for (const tween of gsap.getTweensOf(hero())) tween.parent?.pause().progress(.5) })
  const middle = parseFloat(hero().style.height)
  expect(middle).toBeGreaterThan(closed)
  await clickToggle()
  expect(parseFloat(hero().style.height)).toBeCloseTo(middle, -1)
  await act(() => { for (const tween of gsap.getTweensOf(hero())) tween.parent?.progress(1) })
  expect(parseFloat(hero().style.height)).toBeCloseTo(closed)
  await act(() => root.render(<div />))
  expect(remove).toHaveBeenCalledWith('wheel', expect.any(Function))
  expect(remove).toHaveBeenCalledWith('touchmove', expect.any(Function))
})
it('keeps the existing overlay dismissible during a gallery animation', async () => {
  const close = vi.fn()
  await act(() => root.render(<ProjectOverlay project={{ ...projects[0], gallery }} source={null} reduced={false} onClose={close} />))
  const button = scroller.querySelector<HTMLButtonElement>('.hero-gallery-toggle')!
  await act(() => button.click())
  await act(() => button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })))
  expect(close).toHaveBeenCalledTimes(1)
  expect(scroller.querySelectorAll('[role="dialog"]')).toHaveLength(1)
})
