import { useLayoutEffect, useRef } from 'react'
import { ArrowUpRight, Check, Mail, Send } from 'lucide-react'
import type { ContactFormModel } from '../../hooks/useContactForm'
import type { ContactConfig } from '../../config/contact'
import { contactMailto } from '../../config/contact'
import { CONTACT_LIMITS } from '../../services/contactService'
import { createLetterConfirmation } from '../../animation/contactAnimations'

export function ContactForm({ model, config, active, reduced }: { model: ContactFormModel; config: ContactConfig; active: boolean; reduced: boolean }) {
  const { state } = model
  const letter = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const confirmation = useRef<HTMLDivElement>(null)
  const error = useRef<HTMLParagraphElement>(null)
  const previousPhase = useRef(state.phase)
  const mailto = contactMailto(config)
  const firstError = (['name', 'email', 'message'] as const).find(key => state.errors[key])
  useLayoutEffect(() => {
    let frame = 0
    if (active) {
      if (state.phase === 'sent') frame = requestAnimationFrame(() => confirmation.current?.focus({ preventScroll: true }))
      else if (state.phase === 'error') frame = requestAnimationFrame(() => {
        const target = firstError ? form.current?.elements.namedItem(firstError) as HTMLElement | null : error.current
        target?.focus()
      })
      else if (previousPhase.current === 'sent' && state.phase === 'editing') frame = requestAnimationFrame(() => (form.current?.elements.namedItem('name') as HTMLElement | null)?.focus())
    }
    previousPhase.current = state.phase
    return () => cancelAnimationFrame(frame)
  }, [active, state.phase, state.error, firstError])
  useLayoutEffect(() => {
    if (state.phase !== 'sent' || !active) return
    const ctx = createLetterConfirmation(letter.current!, reduced)
    return () => ctx.revert()
  }, [active, reduced, state.phase])

  return <div className="contact-letter" ref={letter} data-scene-gesture-ignore="">
    <div className="letter-meta"><span>UNE LETTRE NUMÉRIQUE</span><ArrowUpRight size={17} strokeWidth={1.4} aria-hidden="true" /></div>
    {state.phase === 'sent' ? <div className="contact-confirmation" role="status" aria-live="polite" tabIndex={-1} ref={confirmation}><span className="confirmation-mark" aria-hidden="true"><Check size={25} strokeWidth={1.4} /></span><p className="letter-eyebrow">CORRESPONDANCE REÇUE</p><h3>Message bien reçu<span>.</span></h3><p>Merci pour ces quelques lignes. Le service d’envoi a confirmé la prise en charge de votre message.</p><p className="confirmation-farewell">À bientôt.</p><button type="button" className="button button-secondary" onClick={model.reset}>Écrire un nouveau message <ArrowUpRight size={16} /></button></div> : <>
      <div className="letter-intro"><h3>Bonjour Tracy,</h3><p>Quelques lignes suffisent pour commencer.</p></div>
      {!config.endpoint && <p className="contact-availability" role="note">L’envoi direct n’est pas encore disponible. {mailto ? 'Vous pouvez m’écrire avec votre messagerie.' : 'Mes coordonnées seront ajoutées prochainement.'}</p>}
      <form className="contact-form" ref={form} noValidate onSubmit={event => { event.preventDefault(); void model.send() }} aria-label="Formulaire de contact" aria-busy={state.phase === 'sending'}>
        <fieldset disabled={state.phase === 'sending'}><legend className="contact-sr-only">Votre correspondance</legend><div className="contact-field-row">
          <div className="contact-field"><label htmlFor="contact-name">Votre nom</label><input id="contact-name" name="name" autoComplete="name" required maxLength={CONTACT_LIMITS.name} value={state.values.name} onChange={event => model.change('name', event.target.value)} onBlur={() => model.blur('name')} aria-invalid={!!state.errors.name} aria-describedby={state.errors.name ? 'contact-name-error' : undefined} />{state.errors.name && <p className="contact-field-error" id="contact-name-error">{state.errors.name}</p>}</div>
          <div className="contact-field"><label htmlFor="contact-email">Votre email</label><input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={CONTACT_LIMITS.email} value={state.values.email} onChange={event => model.change('email', event.target.value)} onBlur={() => model.blur('email')} aria-invalid={!!state.errors.email} aria-describedby={state.errors.email ? 'contact-email-error' : undefined} />{state.errors.email && <p className="contact-field-error" id="contact-email-error">{state.errors.email}</p>}</div>
        </div><div className="contact-field"><label htmlFor="contact-message">Votre message</label><textarea id="contact-message" name="message" rows={3} required maxLength={CONTACT_LIMITS.message} value={state.values.message} onChange={event => model.change('message', event.target.value)} onBlur={() => model.blur('message')} aria-invalid={!!state.errors.message} aria-describedby={`contact-message-hint${state.errors.message ? ' contact-message-error' : ''}`} /><span className="contact-field-hint" id="contact-message-hint">5 000 caractères maximum.</span>{state.errors.message && <p className="contact-field-error" id="contact-message-error">{state.errors.message}</p>}</div>
        <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Ne pas remplir ce champ</label><input id="contact-website" name="website" autoComplete="off" tabIndex={-1} maxLength={200} onChange={event => model.setWebsite(event.target.value)} /></div></fieldset>
        {state.error && <p className="contact-submit-error" role="alert" tabIndex={-1} ref={error}>{state.error}</p>}
        <div className="contact-letter-actions"><button type="submit" className="button button-primary" disabled={!config.endpoint || state.phase === 'sending'}>{state.phase === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}<Send size={15} strokeWidth={1.5} aria-hidden="true" /></button><span>{config.endpoint ? 'Les trois champs sont obligatoires.' : 'Envoi direct indisponible'}</span></div>
      </form>
    </>}
    <div className="contact-letter-signature"><span>À l’attention de<br /><strong>{config.ownerName}</strong></span>{mailto ? <a href={mailto}><Mail size={14} />Écrire par email<ArrowUpRight size={13} /></a> : <span className="contact-email-missing">Adresse email à renseigner</span>}</div>
  </div>
}
