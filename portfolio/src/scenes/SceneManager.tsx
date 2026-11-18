import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { X } from 'lucide-react'
import { Bloub } from '../mascot/Bloub'
import type { MascotController } from '../mascot/types'
import { createIntroTimeline } from '../animation/introTimeline'
import { Hero } from '../components/Hero'
import { Introduction } from '../components/Introduction'
import { FloatingNavigation } from '../components/FloatingNavigation'
import { usePreferences } from '../hooks/usePreferences'
import { ProjectsScene } from './ProjectsScene'
import { createSceneTransition, SCENE_DURATION } from '../animation/sceneTransition'
import type { ContentScene } from '../animation/sceneTransition'
import type { Scene } from '../components/FloatingNavigation'
import { bindSceneGestures } from '../animation/sceneGestures'
import { JourneyScene } from './JourneyScene'
import type { ProjectsSceneHandle } from './ProjectsScene'
import { SkillsScene } from './SkillsScene'
import { projectById } from '../data/projects'
import { ProjectOverlay } from '../components/projects/ProjectOverlay'
import { ContactScene } from './ContactScene'
import { MorphingBackground } from '../components/background/MorphingBackground'
import type { BackgroundController } from '../components/background/backgroundAnimations'

export function SceneManager() {
  const stage = useRef<HTMLElement>(null)
  const background = useRef<BackgroundController>(null)
  const hero = useRef<HTMLElement>(null)
  const intro = useRef<HTMLDivElement>(null)
  const greeting = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const nav = useRef<HTMLElement>(null)
  const homeSlot = useRef<HTMLButtonElement>(null)
  const heroPanel = useRef<HTMLDivElement>(null)
  const projectsPanel = useRef<HTMLElement>(null)
  const journeyPanel = useRef<HTMLElement>(null)
  const skillsPanel = useRef<HTMLElement>(null)
  const contactPanel = useRef<HTMLElement>(null)
  const contactAnchor = useRef<HTMLDivElement>(null)
  const pendingSkillProject = useRef<string | null>(null)
  const projectsApi = useRef<ProjectsSceneHandle>(null)
  const mascot = useRef<MascotController>(null)
  const animation = useRef<ReturnType<typeof createIntroTimeline> | null>(null)
  const sceneMotion = useRef<ReturnType<typeof createSceneTransition> | null>(null)
  const [active, setActive] = useState<Scene>('intro')
  const activeRef = useRef<Scene>('intro')
  const [transitioning, setTransitioning] = useState(false)
  const [bloubInNav, setBloubInNav] = useState(false)
  const projectsMain = useRef(true)
  const projectsBusy = useRef(false)
  const [replay, setReplay] = useState(0)
  const [notice, setNotice] = useState('')
  const [externalProject, setExternalProject] = useState<string | null>(null)
  const preferences = usePreferences()
  const reducedRef = useRef(preferences.reduced)
  const viewChanged = useCallback((main: boolean) => { projectsMain.current = main }, [])
  const galleryBusy = useCallback((busy: boolean) => { projectsBusy.current = busy }, [])
  const goTo = useCallback((scene: ContentScene) => {
    if (projectsBusy.current || sceneMotion.current?.busy) return false
    if (activeRef.current === 'intro') animation.current?.finish()
    return sceneMotion.current?.go(scene) ?? false
  }, [])
  const openSkillProject = useCallback((id: string) => {
    if (!projectById.has(id) || projectsBusy.current || sceneMotion.current?.busy) return
    pendingSkillProject.current = id
    if (!goTo('projects')) pendingSkillProject.current = null
  }, [goTo])
  const openProjectFromScene = useCallback((id: string) => {
    if (!projectById.has(id) || projectsBusy.current || sceneMotion.current?.busy) return
    setExternalProject(id)
  }, [])
  const skip = useCallback(() => {
    if (activeRef.current !== 'intro' && activeRef.current !== 'hero') { goTo('hero'); return }
    animation.current?.finish()
    requestAnimationFrame(() => document.getElementById('hero-title')?.focus({ preventScroll: true }))
  }, [goTo])

  useLayoutEffect(() => {
    const originalOverflow = document.body.style.overflow
    const ctx = gsap.context(() => {}, stage)
    let introDone = false
    let resizeFrame = 0
    const complete = () => {
      introDone = true
      try { background.current?.settle('hero') } catch { /* Decorative rendering cannot prevent access to the Hero. */ }
      activeRef.current = 'hero'
      setActive('hero')
      document.body.style.overflow = originalOverflow
      if (intro.current?.contains(document.activeElement)) {
        requestAnimationFrame(() => document.getElementById('hero-title')?.focus({ preventScroll: true }))
      }
    }
    document.body.style.overflow = 'hidden'
    try {
      ctx.add(() => {
        sceneMotion.current = createSceneTransition({
          background: background.current!,
          stage: stage.current!, heroPanel: hero.current!, heroScroll: hero.current!.querySelector<HTMLElement>('.hero-grid')!, projectsPanel: projectsPanel.current!, journeyPanel: journeyPanel.current!, skillsPanel: skillsPanel.current!, contactPanel: contactPanel.current!, contactAnchor: contactAnchor.current!, frame: frame.current!, home: homeSlot.current!,
          mascotElement: stage.current!.querySelector<HTMLElement>('.mascot')!, mascot: mascot.current!, reduced: () => reducedRef.current,
          onStart(scene) {
            if (activeRef.current === 'journey' && scene === 'projects') projectsApi.current?.showMain()
            setBloubInNav(scene !== 'contact' && !(scene === 'hero' && activeRef.current === 'contact'))
            activeRef.current = scene; setActive(scene); setTransitioning(true)
          },
          onComplete(scene) {
            activeRef.current = scene; setActive(scene); setTransitioning(false); setBloubInNav(scene !== 'hero' && scene !== 'contact')
            if (scene === 'projects' && pendingSkillProject.current) {
              const id = pendingSkillProject.current
              pendingSkillProject.current = null
              if (projectsApi.current?.openProject(id, () => goTo('skills'))) return
            }
            requestAnimationFrame(() => {
              const heading = scene === 'hero' ? document.getElementById('hero-title') : scene === 'journey' ? document.getElementById('journey-title') : scene === 'skills' ? document.getElementById('skills-title') : scene === 'contact' ? document.getElementById('contact-title') : projectsPanel.current?.querySelector<HTMLElement>('[data-project-view][data-visible="true"] h2')
              heading?.focus({ preventScroll: true })
            })
          },
        })
        animation.current = createIntroTimeline({ stage: stage.current!, hero: hero.current!, intro: intro.current!, greeting: greeting.current!, frame: frame.current!, nav: nav.current!, mascot: mascot.current!, reduced: reducedRef.current, onComplete: complete })
        if (replay > 0 && !reducedRef.current) {
          try { background.current?.appendTo(animation.current.timeline, 'intro', SCENE_DURATION) } catch { /* Preserve the existing introduction if decoration fails. */ }
        }
      })
    } catch (error) {
      console.error('Introduction interrompue ; affichage du contenu.', error)
      gsap.set(hero.current, { x: 0, autoAlpha: 1 })
      gsap.set(intro.current, { autoAlpha: 0 })
      gsap.set(nav.current, { autoAlpha: 1, clearProps: 'transform' })
      complete()
    }
    // Settle interrupted timelines, then read both actual anchors in the new viewport.
    const resize = () => {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(() => { animation.current?.finish(); sceneMotion.current?.resize() })
    }
    const trackPortrait = () => { if (introDone) sceneMotion.current?.updateHeroAnchor() }
    const heroElement = heroPanel.current!
    const contactElement = contactPanel.current!
    const trackContact = () => sceneMotion.current?.updateContactAnchor()
    // Copy fallback or font changes can resize the centered composition without a viewport resize.
    const contactResize = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(trackContact)
    const contactContent = contactElement.querySelector('.contact-content')
    if (contactContent) {
      contactResize?.observe(contactContent)
      for (const child of contactContent.children) contactResize?.observe(child)
    }
    heroElement.addEventListener('scroll', trackPortrait, { passive: true, capture: true })
    contactElement.addEventListener('scroll', trackContact, { passive: true, capture: true })
    window.addEventListener('resize', resize)
    window.visualViewport?.addEventListener('resize', resize)
    const unbindGestures = bindSceneGestures({ element: stage.current!, current: () => activeRef.current, locked: () => !!sceneMotion.current?.busy || projectsBusy.current, projectsMain: () => projectsMain.current, navigate: goTo })
    return () => {
      unbindGestures()
      cancelAnimationFrame(resizeFrame)
      heroElement.removeEventListener('scroll', trackPortrait, true)
      contactElement.removeEventListener('scroll', trackContact, true)
      contactResize?.disconnect()
      window.removeEventListener('resize', resize)
      window.visualViewport?.removeEventListener('resize', resize)
      sceneMotion.current?.dispose()
      sceneMotion.current = null
      animation.current?.dispose()
      animation.current = null
      ctx.revert()
      document.body.style.overflow = originalOverflow
    }
  }, [replay, goTo])

  useEffect(() => {
    reducedRef.current = preferences.reduced
    animation.current?.setReduced(preferences.reduced)
    if (preferences.reduced && sceneMotion.current?.busy) sceneMotion.current.settle()
  }, [preferences.reduced])

  useEffect(() => {
    const trackMascot = active === 'hero' || active === 'contact' || (active !== 'intro' && bloubInNav)
    if (!trackMascot || preferences.reduced || transitioning) return
    const controller = mascot.current
    const lookAt = (event: PointerEvent) => controller?.lookAt(event.clientX, event.clientY)
    const lookAway = () => controller?.lookAway()
    window.addEventListener('pointermove', lookAt)
    document.documentElement.addEventListener('mouseleave', lookAway)
    window.addEventListener('blur', lookAway)
    return () => {
      window.removeEventListener('pointermove', lookAt)
      document.documentElement.removeEventListener('mouseleave', lookAway)
      window.removeEventListener('blur', lookAway)
      controller?.lookAway()
    }
  }, [active, preferences.reduced, transitioning, bloubInNav])

  const navigate = (scene: Scene) => {
    if (sceneMotion.current?.busy || projectsBusy.current) return
    setExternalProject(null)
    setNotice('')
    if (scene !== 'intro' && scene !== 'hero') goTo(scene)
    else if (scene === 'hero') skip()
    else if (preferences.reduced) setNotice('Les animations sont réduites. Réactivez-les pour rejouer l’introduction.')
    else { activeRef.current = 'intro'; setBloubInNav(false); setActive('intro'); setReplay(v => v + 1) }
  }

  const externalProjectData = externalProject ? projectById.get(externalProject) : undefined

  return <>
    <a className="skip-link" href="#hero-title" onClick={skip}>Aller au contenu</a>
    <main className="stage" ref={stage} data-scene={active} data-transitioning={transitioning}>
      <MorphingBackground ref={background} reduced={preferences.reduced} />
      <Introduction introRef={intro} greetingRef={greeting} skip={skip} active={active === 'intro'} />
      <Bloub ref={mascot} />
      <div className="scene-panel hero-panel" ref={heroPanel} data-scene-scroll="" aria-hidden={active !== 'hero' || transitioning} inert={active !== 'hero' || transitioning}>
        <Hero heroRef={hero} frameRef={frame} active={active === 'hero' && !transitioning} announce={setNotice} showProjects={() => goTo('projects')} showContact={() => goTo('contact')} />
      </div>
      <ProjectsScene sceneRef={projectsPanel} apiRef={projectsApi} active={active === 'projects' && !transitioning} reduced={preferences.reduced} onViewChange={viewChanged} onBusyChange={galleryBusy} home={() => goTo('hero')} journey={() => goTo('journey')} />
      <JourneyScene sceneRef={journeyPanel} active={active === 'journey' && !transitioning} visible={active === 'journey'} reduced={preferences.reduced} projects={() => goTo('projects')} skills={() => goTo('skills')} openProject={openProjectFromScene} />
      <SkillsScene sceneRef={skillsPanel} active={active === 'skills' && !transitioning} visible={active === 'skills'} reduced={preferences.reduced} journey={() => goTo('journey')} contact={() => goTo('contact')} openProject={openSkillProject} />
      <ContactScene sceneRef={contactPanel} anchorRef={contactAnchor} active={active === 'contact' && !transitioning} visible={active === 'contact'} reduced={preferences.reduced} home={() => goTo('hero')} skills={() => goTo('skills')} />
      {externalProjectData && <ProjectOverlay project={externalProjectData} source={null} reduced={preferences.reduced} onClose={() => setExternalProject(null)} />}
    </main>
    <FloatingNavigation navRef={nav} homeRef={homeSlot} active={active} busy={transitioning} bloubInNav={bloubInNav} {...preferences} navigate={navigate} />
    <div className={`notice ${notice ? 'notice-visible' : ''}`} role="status" aria-live="polite">{notice && <><span>{notice}</span><button aria-label="Fermer le message" onClick={() => setNotice('')}><X size={16} /></button></>}</div>
  </>
}


