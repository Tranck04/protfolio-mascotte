import { useLayoutEffect, useRef } from 'react'
import { Copy, Mail, ArrowUpRight } from 'lucide-react'
import { contactMailto } from '../../config/contact'
import type { ContactConfig } from '../../config/contact'
import { useCopyEmail } from '../../hooks/useCopyEmail'
import type { MascotReaction } from '../../mascot/reactions'

export function ContactActions({ config, active, onReact }: { config: ContactConfig; active: boolean; onReact?: (reaction: MascotReaction) => void }) {
  const mailto = contactMailto(config)
  const { state, copy } = useCopyEmail(mailto ? config.email : undefined)
  const address = useRef<HTMLElement>(null)
  const selectAddress = () => {
    if (!address.current) return
    const range = document.createRange()
    range.selectNodeContents(address.current)
    const selection = window.getSelection()
    selection?.removeAllRanges(); selection?.addRange(range)
  }
  useLayoutEffect(() => {
    if (state === 'error' && active) { address.current?.focus(); selectAddress() }
  }, [state, active])
  // Only a resolved clipboard request may make Bloub celebrate.
  const runCopy = async () => { if (await copy()) onReact?.('email-copied') }
  if (!mailto) return <p className="contact-email-missing">Adresse email à renseigner.</p>
  return <div className="contact-actions" data-contact-enter="">
    <a className="button button-primary contact-email" href={mailto} onClick={() => onReact?.('email-opened')}><Mail size={18} aria-hidden="true" />M’écrire un email<ArrowUpRight size={17} aria-hidden="true" /></a>
    <button type="button" className="contact-copy" disabled={state === 'copying'} onClick={() => void runCopy()}><Copy size={14} aria-hidden="true" />{state === 'copying' ? 'Copie en cours…' : 'Copier mon adresse email'}</button>
    <p className="contact-copy-status" role="status" aria-live="polite">{state === 'copied' ? 'Adresse copiée' : ''}</p>
    {state === 'error' && <div className="contact-copy-fallback" role="alert"><p>La copie automatique est indisponible. Sélectionnez cette adresse et utilisez la commande Copier :</p><code ref={address} tabIndex={0} aria-label="Adresse email à copier manuellement" onFocus={selectAddress}>{config.email}</code></div>}
  </div>
}
