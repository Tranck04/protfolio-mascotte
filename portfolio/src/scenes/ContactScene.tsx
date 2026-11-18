import { useLayoutEffect, useRef } from 'react'
import type { Ref } from 'react'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { contactConfig } from '../config/contact'
import type { ContactConfig } from '../config/contact'
import { ContactActions } from '../components/contact/ContactActions'
import { ContactLinks } from '../components/contact/ContactLinks'
import { createContactEntrance } from '../animation/contactAnimations'

export function ContactScene({ sceneRef, anchorRef, active, visible, reduced, home, skills, config = contactConfig }: {
  sceneRef: Ref<HTMLElement>; anchorRef: Ref<HTMLDivElement>; active: boolean; visible: boolean; reduced: boolean;
  home: () => void; skills: () => void; config?: ContactConfig;
}) {
  const content = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!visible) return
    const ctx = createContactEntrance(content.current!, reduced)
    return () => ctx.revert()
  }, [visible, reduced])
  return <section className="scene-panel contact-panel" ref={sceneRef} data-scene-scroll="" aria-labelledby="contact-title" aria-hidden={!active} inert={!active}>
    <div className="contact-shell" ref={content}>
      <div className="contact-topline"><span className="eyebrow"><span className="tiny-dot" />05 — CONTACT</span><span>LES BONNES IDÉES COMMENCENT PAR UN ÉCHANGE.</span></div>
      <div className="scene-body contact-body" data-scene-scroll=""><div className="contact-content">
        <div className="contact-heading" data-contact-enter=""><h2 id="contact-title" tabIndex={-1}>Me <em>contacter.</em></h2><p>Un projet, une opportunité ou une idée à partager ?</p></div>
        <div className="contact-mascot-anchor" ref={anchorRef} aria-hidden="true" />
        <ContactActions config={config} active={active} />
        <ContactLinks config={config} />
      </div></div>
      <footer className="contact-footer"><button type="button" onClick={skills}><ArrowUp size={13} aria-hidden="true" />Compétences</button><span>© {new Date().getFullYear()} {config.ownerName}</span><button type="button" onClick={home}>Retour au début<ArrowUpRight size={15} aria-hidden="true" /></button></footer>
    </div>
  </section>
}
