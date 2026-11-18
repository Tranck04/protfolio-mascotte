import { useLayoutEffect, useRef } from 'react'
import type { Ref } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { contactConfig } from '../config/contact'
import type { ContactConfig } from '../config/contact'
import { submitContact } from '../services/contactService'
import type { ContactSubmitter } from '../services/contactService'
import { useContactForm } from '../hooks/useContactForm'
import { ContactForm } from '../components/contact/ContactForm'
import { ContactLinks } from '../components/contact/ContactLinks'
import { createContactEntrance } from '../animation/contactAnimations'

export function ContactScene({ sceneRef, anchorRef, active, visible, reduced, home, skills, onConfirmed, config = contactConfig, submitter = submitContact }: {
  sceneRef: Ref<HTMLElement>; anchorRef: Ref<HTMLDivElement>; active: boolean; visible: boolean; reduced: boolean;
  home: () => void; skills: () => void; onConfirmed: () => void; config?: ContactConfig; submitter?: ContactSubmitter;
}) {
  const content = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  useLayoutEffect(() => { activeRef.current = active }, [active])
  const model = useContactForm(submitter, () => { if (activeRef.current) onConfirmed() })
  useLayoutEffect(() => {
    if (!visible) return
    const ctx = createContactEntrance(content.current!, reduced)
    return () => ctx.revert()
  }, [visible, reduced])
  return <section className="scene-panel contact-panel" ref={sceneRef} data-scene-scroll="" aria-labelledby="contact-title" aria-hidden={!active} inert={!active}>
    <div className="contact-shell" ref={content}><div className="contact-topline"><span className="eyebrow"><span className="tiny-dot" />05 — CONTACT</span><span>LES BONNES IDÉES COMMENCENT PAR UN ÉCHANGE.</span></div>
      <div className="scene-body contact-body" data-scene-scroll=""><div className="contact-layout"><div className="contact-welcome"><div className="contact-heading"><h2 id="contact-title" tabIndex={-1}>Une idée en tête ?<br /><em>Parlons-en.</em></h2><p>Un projet, une opportunité ou simplement une conversation intéressante.</p></div><div className="contact-hello"><div className="contact-mascot-anchor" ref={anchorRef} aria-hidden="true" /><div className="contact-bubble" data-contact-bubble="" aria-hidden="true">{model.state.phase === 'sent' ? 'À bientôt.' : 'On garde le contact ?'}</div></div><ContactLinks config={config} /></div><ContactForm model={model} config={config} active={active} reduced={reduced} /></div></div>
      <footer className="contact-footer"><span>© {new Date().getFullYear()} {config.ownerName}</span><button type="button" onClick={skills}><ArrowLeft size={13} />Compétences</button><button type="button" onClick={home}>Retour au début<ArrowUpRight size={15} /></button></footer>
    </div>
  </section>
}
