import { contactConfig, contactEndpoint, validContactEmail } from '../config/contact'

export type ContactPayload = { name: string; email: string; message: string }
export type ContactErrors = Partial<Record<keyof ContactPayload, string>>
export type ContactResult = { success: true } | { success: false; error: string; code: 'unavailable' | 'validation' | 'spam' | 'network' | 'rejected' | 'timeout' | 'aborted' }
export type ContactSubmitOptions = { signal?: AbortSignal; website?: string }
export type ContactSubmitter = (payload: ContactPayload, options?: ContactSubmitOptions) => Promise<ContactResult>
export const CONTACT_LIMITS = { name: 100, email: 254, message: 5000 } as const

export function validateContact(payload: ContactPayload): ContactErrors {
  const errors: ContactErrors = {}
  if (!payload.name.trim()) errors.name = 'Indiquez votre nom.'
  else if (payload.name.length > CONTACT_LIMITS.name) errors.name = 'Le nom doit contenir au maximum 100 caractères.'
  if (!payload.email.trim()) errors.email = 'Indiquez votre adresse email.'
  else if (!validContactEmail(payload.email.trim())) errors.email = 'Indiquez une adresse email valide, de 254 caractères maximum.'
  if (!payload.message.trim()) errors.message = 'Écrivez votre message.'
  else if (payload.message.length > CONTACT_LIMITS.message) errors.message = 'Le message doit contenir au maximum 5 000 caractères.'
  return errors
}

/** No positive fallback: only an explicit acknowledgement from the configured endpoint succeeds. */
export function createContactSubmitter(endpoint?: string, fetcher: typeof fetch = globalThis.fetch): ContactSubmitter {
  return async (payload, options = {}) => {
    if (Object.keys(validateContact(payload)).length) return { success: false, code: 'validation', error: 'Vérifiez les champs indiqués avant de réessayer.' }
    if (options.website?.trim()) return { success: false, code: 'spam', error: 'Le message n’a pas pu être envoyé. Réessayez ou utilisez l’email.' }
    const url = contactEndpoint(endpoint)
    if (!url) return { success: false, code: 'unavailable', error: 'L’envoi direct n’est pas encore disponible. Aucun message n’a été envoyé.' }
    if (options.signal?.aborted) return { success: false, code: 'aborted', error: 'L’envoi a été interrompu.' }
    const controller = new AbortController()
    let timedOut = false
    const abort = () => controller.abort()
    options.signal?.addEventListener('abort', abort, { once: true })
    const timer = setTimeout(() => { timedOut = true; controller.abort() }, 15000)
    try {
      const response = await fetcher(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: payload.name.trim(), email: payload.email.trim(), message: payload.message.trim(), website: options.website?.trim() ?? '' }),
        credentials: 'omit', redirect: 'error', signal: controller.signal,
      })
      if (controller.signal.aborted) return { success: false, code: timedOut ? 'timeout' : 'aborted', error: 'L’envoi a été interrompu ; sa réception n’a pas été confirmée.' }
      if (!response.ok) return { success: false, code: 'rejected', error: response.status === 429 ? 'Trop de tentatives rapprochées. Patientez avant de réessayer ; votre texte est conservé.' : 'Le service n’a pas accepté le message. Votre texte est conservé ; réessayez ou utilisez l’email.' }
      const result: unknown = await response.json()
      if (result && typeof result === 'object' && 'success' in result && result.success === true) return { success: true }
      return { success: false, code: 'rejected', error: 'La réception du message n’a pas été confirmée. Votre texte est conservé.' }
    } catch {
      return { success: false, code: timedOut ? 'timeout' : options.signal?.aborted ? 'aborted' : 'network', error: timedOut ? 'Le service met trop de temps à répondre. Votre texte est conservé ; vous pouvez réessayer.' : options.signal?.aborted ? 'L’envoi a été interrompu.' : 'Impossible de confirmer l’envoi. Vérifiez votre connexion ou réessayez ; votre texte est conservé.' }
    } finally { clearTimeout(timer); options.signal?.removeEventListener('abort', abort) }
  }
}
export const submitContact = createContactSubmitter(contactConfig.endpoint)
