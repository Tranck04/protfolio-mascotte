import { ArrowRight } from 'lucide-react'
import type { RefObject } from 'react'

export function Introduction({ introRef, greetingRef, skip, active }: { introRef: RefObject<HTMLDivElement | null>; greetingRef: RefObject<HTMLDivElement | null>; skip: () => void; active: boolean }) {
  return <div className="introduction" ref={introRef} aria-hidden={!active} inert={!active}>
    <div className="greeting" ref={greetingRef}><span><span className="greeting-word">Bonjour</span><span className="greeting-period">.</span></span></div>
    <div className="intro-footer"><span className="intro-caption">TRACY FRANCK MUKENDI<span>Ravi de vous rencontrer.</span></span><button className="skip-button" onClick={skip}>Passer l’introduction <ArrowRight size={16} /></button></div>
  </div>
}
