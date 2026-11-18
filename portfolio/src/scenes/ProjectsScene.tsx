import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import gsap from 'gsap'
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight } from 'lucide-react'
import { FeaturedGallery } from '../components/projects/FeaturedGallery'
import { SecondaryGallery } from '../components/projects/SecondaryGallery'
import { ProjectOverlay } from '../components/projects/ProjectOverlay'
import { projectById, secondaryProjects } from '../data/projects'

type Gallery = 'featured' | 'archive'
type ViewState = { current: Gallery; previous: Gallery | null }
type OverlayState = { id: string; source: HTMLElement | null; onReturn?: () => void }
export type ProjectsSceneHandle = { showMain: () => void; openProject: (id: string, onReturn?: () => void) => boolean }

export function ProjectsScene({ sceneRef, apiRef, active, reduced, onViewChange, onBusyChange, home, journey }: {
  sceneRef: Ref<HTMLElement>; apiRef?: Ref<ProjectsSceneHandle>; active: boolean; reduced: boolean;
  onViewChange: (main: boolean) => void; onBusyChange: (busy: boolean) => void; home: () => void; journey: () => void;
}) {
  const [view, setView] = useState<ViewState>({ current: 'featured', previous: null })
  const [overlay, setOverlay] = useState<OverlayState | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const animation = useRef<gsap.core.Timeline | null>(null)
  const viewBusy = view.previous !== null
  const mainHeading = useRef<HTMLHeadingElement>(null)

  const change = (next: Gallery) => {
    if (viewBusy || next === view.current || overlay) return
    setView({ current: next, previous: reduced ? null : view.current })
    onViewChange(next === 'featured')
    if (reduced) requestAnimationFrame(() => {
      const target = root.current?.querySelector<HTMLElement>(`[data-project-view="${next}"] h2`)
      if (root.current?.dataset.projectsView === next) target?.focus({ preventScroll: true })
    })
  }
  const open = useCallback((id: string, source: HTMLElement | null, onReturn?: () => void) => {
    if (viewBusy || overlay || !projectById.has(id)) return false
    setOverlay({ id, source, onReturn })
    onBusyChange(true)
    return true
  }, [onBusyChange, overlay, viewBusy])
  useImperativeHandle(apiRef, () => ({
    showMain() { setView({ current: 'featured', previous: null }); onViewChange(true) },
    openProject(id, onReturn) {
      const project = projectById.get(id)
      if (!project || !open(id, null, onReturn)) return false
      setView({ current: project.featured ? 'featured' : 'archive', previous: null })
      onViewChange(project.featured)
      return true
    },
  }), [onViewChange, open])
  const close = () => {
    if (!overlay) return
    setOverlay(null)
    onBusyChange(false)
    overlay.onReturn?.()
  }

  useLayoutEffect(() => {
    if (!view.previous || !root.current) return
    const previous = root.current.querySelector<HTMLElement>(`[data-project-view="${view.previous}"]`)!
    const next = root.current.querySelector<HTMLElement>(`[data-project-view="${view.current}"]`)!
    const forward = view.current === 'archive'
    onBusyChange(true)
    let disposed = false
    let completed = false
    let watchdog: ReturnType<typeof setTimeout> | undefined
    const finish = () => {
      if (disposed || completed) return
      completed = true
      clearTimeout(watchdog)
      setView({ current: view.current, previous: null })
      onBusyChange(false)
      requestAnimationFrame(() => {
        const target = next.querySelector<HTMLElement>('h2')
        if (root.current?.dataset.projectsView === view.current) target?.focus({ preventScroll: true })
      })
    }
    let ctx: gsap.Context | undefined
    try {
      ctx = gsap.context(() => {
        animation.current = gsap.timeline({ onComplete: finish, onInterrupt: finish })
          .fromTo(previous, { x: 0, opacity: 1 }, { x: forward ? -40 : 40, opacity: 0, duration: .35, ease: 'power2.inOut' }, 0)
          .fromTo(next, { x: forward ? 55 : -55, opacity: 0 }, { x: 0, opacity: 1, duration: .45, ease: 'power2.out' }, .05)
      }, root)
      watchdog = setTimeout(finish, 900)
    } catch { queueMicrotask(finish) }
    return () => { disposed = true; clearTimeout(watchdog); animation.current?.kill(); ctx?.revert() }
  }, [view, onBusyChange])

  useEffect(() => {
    if (reduced || !active) animation.current?.progress(1)
  }, [reduced, active])

  useEffect(() => () => onBusyChange(false), [onBusyChange])

  const isVisible = (name: Gallery) => view.current === name || view.previous === name
  const interactive = (name: Gallery) => active && view.current === name && !viewBusy && !overlay
  const project = overlay ? projectById.get(overlay.id) : null

  return <section className="scene-panel projects-panel" ref={sceneRef} aria-label="Projets" aria-hidden={!active} inert={!active}>
    <div className="projects-views" ref={root} data-projects-view={view.current} onKeyDown={event => { if (event.key === 'Escape' && view.current === 'archive' && !overlay) { event.stopPropagation(); change('featured') } }}>
      <div className="project-view featured-view" data-project-view="featured" data-scene-scroll="" data-visible={isVisible('featured')} aria-hidden={!interactive('featured')} inert={!interactive('featured')}>
        <div className="projects-shell"><div className="projects-eyebrow"><span className="eyebrow"><span className="tiny-dot" /> 02 — PROJETS</span><span>EXPLORER / CONSTRUIRE / AFFINER</span></div>
          <div className="scene-body" data-scene-scroll=""><div className="projects-heading"><div><h2 ref={mainHeading} id="projects-title" tabIndex={-1}>Du code.<br className="mobile-only" /> <em>Du concret.</em></h2></div><button className="gallery-switch" disabled={viewBusy || !!overlay} onClick={() => change('archive')}>Autres projets <span>0{secondaryProjects.length}</span><ArrowUpRight size={17} /></button></div>
          <p className="projects-note">Une sélection de projets personnels, académiques et professionnels.</p>
          <FeaturedGallery open={open} />
          </div><div className="projects-footer"><button onClick={home}><ArrowUp size={14} /> Retour à l’accueil</button><button onClick={journey}> Continuer vers le parcours <ArrowDown size={14} /></button></div>
        </div>
      </div>
      <div className="project-view" data-project-view="archive" data-scene-scroll="" data-visible={isVisible('archive')} aria-hidden={!interactive('archive')} inert={!interactive('archive')}>
        <div className="projects-shell"><div className="view-topline"><button className="back-button" onClick={() => change('featured')}><ArrowLeft size={16} /> La sélection</button><span className="eyebrow">02 — PROJETS / EXPLORATIONS</span></div><div className="scene-body" data-scene-scroll=""><div className="archive-heading"><h2 tabIndex={-1}>D’autres <em>pistes.</em></h2><p>Des formats plus petits. La même curiosité.<br />{secondaryProjects.length} projets à explorer.</p></div><SecondaryGallery open={open} /></div><p className="projects-note archive-note">Une sélection de projets plus anciens ou en cours de développement.</p></div>
      </div>
      {overlay && project && <ProjectOverlay project={project} source={overlay.source} reduced={reduced} onClose={close} />}
    </div>
  </section>
}

