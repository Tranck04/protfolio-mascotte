import { BriefcaseBusiness, GraduationCap, House, Layers3, Mail, Moon, Play, Sparkles, Sun, Pause } from 'lucide-react'
import type { Ref } from 'react'

export type Scene = 'intro' | 'hero' | 'projects' | 'journey' | 'skills' | 'contact'
const scenes = [
  { id: 'hero', label: 'Accueil', icon: House }, { id: 'intro', label: 'Introduction', icon: Sparkles },
  { id: 'projects', label: 'Projets', icon: BriefcaseBusiness }, { id: 'journey', label: 'Parcours', icon: GraduationCap },
  { id: 'skills', label: 'Compétences', icon: Layers3 }, { id: 'contact', label: 'Contact', icon: Mail },
] as const
export function FloatingNavigation({ navRef, homeRef, active, dark, reduced, busy, bloubInNav, changeTheme, changeMotion, navigate }: {
  navRef: Ref<HTMLElement>; homeRef: Ref<HTMLButtonElement>; active: Scene; dark: boolean; reduced: boolean; busy: boolean; bloubInNav: boolean;
  changeTheme: () => void; changeMotion: () => void; navigate: (scene: Scene) => void;
}) {
  return <nav className="floating-nav" ref={navRef} aria-label="Navigation des scènes">
    <div className="scene-links">{scenes.map(({ id, label, icon: Icon }) => {
      const selected = active === id
      const homeMascot = id === 'hero' && bloubInNav
      return <div className="nav-item" key={id}>
        <button ref={id === 'hero' ? homeRef : undefined} data-home-slot={id === 'hero' ? '' : undefined} className={`nav-button ${selected ? 'is-active' : ''} ${homeMascot ? 'has-mascot' : ''}`} aria-label={homeMascot ? 'Bloub — Retour à l’accueil' : label} aria-current={selected ? 'step' : undefined} disabled={busy} onClick={() => navigate(id)}><Icon className={homeMascot ? 'home-icon-hidden' : ''} size={18} strokeWidth={1.6} /><span className="active-mark" /></button>
        <span className="tooltip">{homeMascot ? 'Bloub — Retour à l’accueil' : label}</span>
      </div>
    })}</div>
    <span className="nav-divider" />
    <div className="nav-settings">
      <div className="nav-item"><button className="nav-button" onClick={changeTheme} aria-label={dark ? 'Activer le thème clair' : 'Activer le thème sombre'}>{dark ? <Sun size={18} strokeWidth={1.6} /> : <Moon size={18} strokeWidth={1.6} />}</button><span className="tooltip">Thème {dark ? 'clair' : 'sombre'}</span></div>
      <div className="nav-item"><button className="nav-button" onClick={changeMotion} aria-pressed={reduced} aria-label={reduced ? 'Réactiver les animations' : 'Réduire les animations'}>{reduced ? <Play size={17} strokeWidth={1.6} /> : <Pause size={17} strokeWidth={1.6} />}</button><span className="tooltip">{reduced ? 'Réactiver les animations' : 'Réduire les animations'}</span></div>
    </div>
  </nav>
}
