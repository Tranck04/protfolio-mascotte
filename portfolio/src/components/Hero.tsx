import { ArrowDownRight, ArrowUpRight, ArrowDown } from 'lucide-react'
import type { RefObject } from 'react'
import { Portrait } from './Portrait'

export function Hero({ heroRef, frameRef, active, announce, showProjects, showContact }: { heroRef: RefObject<HTMLElement | null>; frameRef: RefObject<HTMLDivElement | null>; active: boolean; announce: (text: string) => void; showProjects: () => void; showContact: () => void }) {
  return <section ref={heroRef} id="hero" className="hero" aria-labelledby="hero-title" inert={!active} aria-hidden={!active}>
    <div className="hero-top"><span className="eyebrow"><span className="tiny-dot" /> PORTFOLIO </span><span className="edition">Casablanca - Maroc</span></div>
    <div className="hero-grid" data-scene-scroll="">
      <div className="hero-copy">
        <p className="role"><span /> Ingénieur Logiciel</p>
        <h1 id="hero-title" tabIndex={-1}>Tracy Franck<br /><span>Mukendi<span className="name-period">.</span></span></h1>
        <div className="hero-intro"><ArrowDownRight size={27} strokeWidth={1.2} aria-hidden="true" /><p>Je conçois des expériences numériques<br className="desktop-break" /> utiles, intuitives et <em>humaines.</em></p></div>
        <p className="hero-description">Master 2 en génie logiciel,<br className="desktop-break" /> Je conçois des logiciels complèts, de l’architecture au déploiement,<br className="desktop-break" /> pour des produits comme pour des clients.</p>
        <div className="hero-actions">
          <button className="button button-primary" onClick={showProjects}>Mes projets <ArrowUpRight size={18} /></button>
          <button className="button button-secondary" onClick={showContact}>Travailler avec moi <ArrowUpRight size={18} /></button>
        </div>
      </div>
      <Portrait frameRef={frameRef} announce={announce} />
    </div>
    <div className="hero-bottom"><span>DE LA CURIOSITÉ. DU CODE. DU SENS.</span><button className="hero-return" onClick={showProjects}>Projets <ArrowDown size={18} /></button></div>
  </section>
}
