import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import { ProjectOverlay } from './ProjectOverlay'
import { noven } from '../../data/projects/noven'

let root: Root, host: HTMLDivElement, source: HTMLButtonElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  source = document.createElement('button'); source.textContent = 'Ouvrir Noven'
  source.getBoundingClientRect = () => new DOMRect(80, 100, 320, 220)
  document.body.appendChild(source); source.focus()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
})
afterEach(async () => { await act(() => root.unmount()); document.body.innerHTML = ''; vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function finish(panel: HTMLElement) {
  await act(() => { for (const tween of gsap.getTweensOf(panel)) tween.parent?.progress(1) })
}

it('preserves the measured opening, focus loop, Escape closing and focus return to the original card', async () => {
  const close = vi.fn()
  await act(() => root.render(<ProjectOverlay project={{ ...noven, links: { website: 'https://example.com' } }} source={source} reduced={false} onClose={close} />))
  const panel = host.querySelector<HTMLElement>('[role="dialog"]')!
  await act(() => { for (const tween of gsap.getTweensOf(panel)) tween.parent?.pause(0) })
  expect(parseFloat(panel.style.width)).toBeCloseTo(320, 0)
  await finish(panel)
  const closeButton = host.querySelector<HTMLButtonElement>('.overlay-close')!
  expect(document.activeElement).toBe(closeButton)
  expect(host.querySelector('.overlay-scroll > .project-study')).not.toBeNull()
  await act(() => closeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })))
  expect(document.activeElement).toBe(host.querySelector('.study-links a'))
  await act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })))
  expect(document.activeElement).toBe(closeButton)
  await act(() => closeButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })))
  expect(close).not.toHaveBeenCalled()
  await finish(panel)
  expect(close).toHaveBeenCalledTimes(1)
  expect(document.activeElement).toBe(source)
  expect(parseFloat(panel.style.width)).toBeCloseTo(320, 0)
})

it('retains reduced-motion opening and backdrop dismissal without duplicating the supplied captures', async () => {
  const close = vi.fn()
  await act(() => root.render(<ProjectOverlay project={{ ...noven, captures: ['/test-capture.png'] }} source={source} reduced onClose={close} />))
  expect(document.activeElement).toBe(host.querySelector('.overlay-close'))
  expect(host.querySelectorAll('img')).toHaveLength(1)
  await act(() => host.querySelector('.project-overlay-backdrop')!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
  expect(close).toHaveBeenCalledTimes(1)
  expect(document.activeElement).toBe(source)
})
