// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ContactScene } from './ContactScene'
import { contactConfig } from '../config/contact'
import type { ContactResult, ContactSubmitter } from '../services/contactService'

let root: Root
let host: HTMLDivElement
const confirmed = vi.fn()
beforeEach(() => {
  confirmed.mockClear(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host)
})
afterEach(async () => { await act(() => root.unmount()); host.remove(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
const render = (submitter: ContactSubmitter, configured = true, active = true) => act(() => root.render(<ContactScene sceneRef={() => {}} anchorRef={() => {}} active={active} visible={active} reduced home={() => {}} skills={() => {}} onConfirmed={confirmed} config={{ ...contactConfig, endpoint: configured ? '/api/contact' : undefined }} submitter={submitter} />))
async function change(name: string, value: string) {
  const input = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)!
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  await act(() => { Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })) })
}
const submit = () => act(() => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
const fill = async () => { await change('name', 'Visiteur test'); await change('email', 'test@example.org'); await change('message', 'Un message de test uniquement. Aucun email réel n’est envoyé.') }

it('clearly exposes unavailable direct sending, real mailto/social links and no simulated confirmation', async () => {
  const service = vi.fn<ContactSubmitter>()
  await render(service, false)
  expect(host.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true)
  expect(host.textContent).toContain('L’envoi direct n’est pas encore disponible')
  expect(host.querySelector('.contact-letter-signature a')!.getAttribute('href')).toMatch(/^mailto:tfmukendi@gmail\.com/)
  expect(host.querySelector('.contact-links a')!.getAttribute('href')).toBe('https://github.com/Tranck04')
  expect(host.querySelector('.contact-bubble')!.textContent).toBe('On garde le contact ?')
  expect(host.querySelector('.contact-confirmation')).toBeNull()
  expect(service).not.toHaveBeenCalled()
})
it('validates required fields and focuses an invalid input without calling the service', async () => {
  vi.useFakeTimers()
  const service = vi.fn<ContactSubmitter>()
  await render(service)
  await submit()
  await act(() => vi.advanceTimersByTime(20))
  expect(service).not.toHaveBeenCalled()
  expect(host.querySelectorAll('[aria-invalid="true"]')).toHaveLength(3)
  expect(document.activeElement).toBe(host.querySelector('#contact-name'))
  expect(host.querySelector('#contact-email')!.getAttribute('aria-describedby')).toBe('contact-email-error')
  expect(host.querySelector('[role="alert"]')!.textContent).toContain('corriger')
})
it('keeps the draft on failure, prevents concurrent requests and only celebrates an explicit success', async () => {
  let respond!: (result: ContactResult) => void
  const service = vi.fn<ContactSubmitter>().mockImplementationOnce(() => new Promise(resolve => { respond = resolve })).mockResolvedValueOnce({ success: true })
  await render(service); await fill()
  await submit(); await submit()
  expect(service).toHaveBeenCalledTimes(1)
  expect(host.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true)
  expect(host.querySelector('.contact-confirmation')).toBeNull()
  expect(confirmed).not.toHaveBeenCalled()
  await act(() => respond({ success: false, code: 'network', error: 'Connexion indisponible. Réessayez.' }))
  expect(host.querySelector<HTMLInputElement>('#contact-name')!.value).toBe('Visiteur test')
  expect(host.querySelector<HTMLTextAreaElement>('#contact-message')!.value).toContain('Aucun email réel')
  expect(host.querySelector('[role="alert"]')!.textContent).toContain('Réessayez')
  expect(host.querySelector('.contact-bubble')!.textContent).toBe('On garde le contact ?')
  expect(confirmed).not.toHaveBeenCalled()
  await submit()
  expect(host.querySelector('.contact-confirmation[role="status"]')).not.toBeNull()
  expect(host.querySelector('.contact-bubble')!.textContent).toBe('À bientôt.')
  expect(confirmed).toHaveBeenCalledTimes(1)
  await act(() => host.querySelector<HTMLButtonElement>('.contact-confirmation button')!.click())
  expect(host.querySelector<HTMLInputElement>('#contact-name')!.value).toBe('')
  expect(host.querySelector('.contact-bubble')!.textContent).toBe('On garde le contact ?')
})
it('does not show success on a thrown error and preserves fields for another attempt', async () => {
  const service = vi.fn<ContactSubmitter>().mockRejectedValue(new Error('offline'))
  await render(service); await fill(); await submit()
  expect(host.querySelector('[role="alert"]')!.textContent).toContain('conservé')
  expect(host.querySelector<HTMLInputElement>('#contact-email')!.value).toBe('test@example.org')
  expect(host.querySelector('.contact-confirmation')).toBeNull()
  expect(confirmed).not.toHaveBeenCalled()
})
it('retains a confirmed result across scene visits without animating a mascot in another scene', async () => {
  let respond!: (result: ContactResult) => void
  const service = vi.fn<ContactSubmitter>().mockImplementation(() => new Promise(resolve => { respond = resolve }))
  await render(service); await fill(); await submit()
  await render(service, true, false)
  await act(() => respond({ success: true }))
  expect(confirmed).not.toHaveBeenCalled()
  await render(service)
  expect(host.querySelector('.contact-confirmation')).not.toBeNull()
  expect(host.querySelector('.contact-bubble')!.textContent).toBe('À bientôt.')
  expect(confirmed).not.toHaveBeenCalled()
})
it('cancels the pending request on unmount without logging personal information', async () => {
  const service = vi.fn<ContactSubmitter>().mockImplementation(() => new Promise(() => {}))
  await render(service); await fill(); await submit()
  const signal = service.mock.calls[0][1]!.signal!
  await act(() => root.render(<div />))
  expect(signal.aborted).toBe(true)
  expect(confirmed).not.toHaveBeenCalled()
})
