import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ContactScene } from './ContactScene'
import { contactConfig } from '../config/contact'

let root: Root, host: HTMLDivElement
const home = vi.fn(), skills = vi.fn()
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
  home.mockClear(); skills.mockClear()
})
afterEach(async () => { await act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function render(config = contactConfig, active = true) {
  await act(() => root.render(<StrictMode><ContactScene sceneRef={() => {}} anchorRef={() => {}} active={active} visible={active} reduced home={home} skills={skills} config={config} /></StrictMode>))
}
const copy = () => host.querySelector<HTMLButtonElement>('.contact-copy')!
const status = () => host.querySelector('[role="status"]')!.textContent

it('renders the centered contact order, real mailto and only GitHub and LinkedIn, without a form or duplicate mascot', async () => {
  await render()
  expect(host.querySelector('h2')!.textContent).toBe('Me contacter.')
  expect(host.querySelector('h2 em')!.textContent).toBe('contacter.')
  expect(host.textContent).toContain('Un projet, une opportunité ou une idée à partager ?')
  expect(host.textContent).toContain('LES BONNES IDÉES COMMENCENT PAR UN ÉCHANGE.')
  expect(host.querySelector('form, input, textarea, .contact-letter, .contact-bubble, .mascot, svg[data-body]')).toBeNull()
  expect([...host.querySelector('.contact-content')!.children].map(child => child.className)).toEqual(['contact-heading', 'contact-mascot-anchor', 'contact-actions', 'contact-links'])
  expect(host.querySelector('.contact-email')!.getAttribute('href')).toMatch(/^mailto:tfmukendi@gmail\.com\?subject=/)
  expect(host.querySelectorAll('.contact-links a')).toHaveLength(2)
  expect(host.querySelector('[aria-label="GitHub — nouvel onglet"]')!.getAttribute('href')).toBe(contactConfig.github)
  expect(host.querySelector('[aria-label="LinkedIn — nouvel onglet"]')!.getAttribute('href')).toBe(contactConfig.linkedin)
  expect(status()).toBe('')
})
it('confirms copying only after Clipboard resolves and prevents duplicate pending requests', async () => {
  let resolve!: () => void
  const writeText = vi.fn(() => new Promise<void>(done => { resolve = done }))
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  await render(); await act(() => copy().click())
  expect(writeText).toHaveBeenCalledWith(contactConfig.email)
  expect(copy().disabled).toBe(true)
  expect(status()).toBe('')
  await act(() => copy().click()); expect(writeText).toHaveBeenCalledTimes(1)
  await act(() => resolve())
  expect(status()).toBe('Adresse copiée')
  expect(copy().disabled).toBe(false)
  expect(home).not.toHaveBeenCalled(); expect(skills).not.toHaveBeenCalled()
  expect(host.textContent).not.toContain('Message bien reçu')
})
it('offers a selectable manual address after a denied copy, without claiming success', async () => {
  vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) } })
  await render(); await act(() => copy().click())
  expect(status()).toBe('')
  expect(host.querySelector('[role="alert"]')!.textContent).toContain('copie automatique est indisponible')
  expect(host.querySelector('code')!.textContent).toBe(contactConfig.email)
  expect(document.activeElement).toBe(host.querySelector('code'))
  expect(window.getSelection()?.toString()).toBe(contactConfig.email)
  expect(copy().disabled).toBe(false)
})
it('uses the manual alternative if the Clipboard API is absent', async () => {
  vi.stubGlobal('navigator', {})
  await render(); await act(() => copy().click())
  expect(host.querySelector('code')!.textContent).toBe(contactConfig.email)
  expect(status()).toBe('')
})
it('allows retrying a failed copy and clears the error only after a genuine success', async () => {
  const writeText = vi.fn().mockRejectedValueOnce(new Error('Denied')).mockResolvedValueOnce(undefined)
  vi.stubGlobal('navigator', { clipboard: { writeText } })
  await render(); await act(() => copy().click())
  expect(host.querySelector('[role="alert"]')).not.toBeNull()
  await act(() => copy().click())
  expect(status()).toBe('Adresse copiée'); expect(host.querySelector('[role="alert"]')).toBeNull()
})
it('does not move focus into an inactive scene if a pending copy fails', async () => {
  let reject!: (error: Error) => void
  vi.stubGlobal('navigator', { clipboard: { writeText: () => new Promise((_, fail) => { reject = fail }) } })
  await render(); await act(() => copy().click()); await render(contactConfig, false)
  const outside = document.createElement('button'); document.body.appendChild(outside); outside.focus()
  await act(() => reject(new Error('Denied')))
  expect(document.activeElement).toBe(outside); outside.remove()
})
it('does not expose fake actions when coordinates are unavailable', async () => {
  await render({ ownerName: contactConfig.ownerName })
  expect(host.querySelector('a, .contact-copy')).toBeNull()
  expect(host.textContent).toContain('Adresse email à renseigner')
})
it('retains copyright and explicit scene navigation', async () => {
  await render()
  expect(host.querySelector('footer')!.textContent).toContain(`© ${new Date().getFullYear()} ${contactConfig.ownerName}`)
  await act(() => host.querySelector<HTMLButtonElement>('footer button')!.click()); expect(skills).toHaveBeenCalledTimes(1)
  await act(() => host.querySelector<HTMLButtonElement>('footer button:last-child')!.click()); expect(home).toHaveBeenCalledTimes(1)
})
