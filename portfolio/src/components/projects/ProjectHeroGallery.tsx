import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ArrowLeft, ArrowRight, Images } from 'lucide-react'
import type { ProjectMedia } from '../../data/projects'
import { useGalleryScrollIntent } from './useGalleryScrollIntent'

type Props = { title: string; signature?: string; gallery?: ProjectMedia[]; reduced?: boolean }
function Heading({ title, signature }: Pick<Props, 'title' | 'signature'>) {
  return <><h2 id="project-detail-title" tabIndex={-1}>{title}<em>.</em></h2>{!!signature?.trim() && <p className="study-signature">{signature}</p>}</>
}
export function ProjectHeroGallery({ title, signature, gallery, reduced = false }: Props) {
  const seen = new Set<string>()
  const images = (gallery ?? []).filter(image => {
    if (!image.src.trim() || seen.has(image.src)) return false
    seen.add(image.src); return true
  })
  // No wrapper, reserved height, background or control for projects without media.
  if (!images.length) return <><p className="study-kicker">01 — ÉTUDE DE PROJET</p><Heading title={title} signature={signature} /></>
  return <Gallery key={title} title={title} signature={signature} images={images} reduced={reduced} />
}

function Gallery({ title, signature, images, reduced }: Omit<Props, 'gallery'> & { images: ProjectMedia[] }) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null), copy = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null), arrows = useRef<HTMLDivElement>(null), toggle = useRef<HTMLButtonElement>(null)
  const initialized = useRef(false)
  const [open, setOpen] = useState(false), [index, setIndex] = useState(0)
  const [visited, setVisited] = useState(() => new Set([0])), [failed, setFailed] = useState(() => new Set<number>())
  const close = useCallback(() => {
    if (arrows.current?.contains(document.activeElement)) toggle.current?.focus({ preventScroll: true })
    setOpen(false)
  }, [])
  useGalleryScrollIntent(root, open, close)

  useLayoutEffect(() => {
    const hero = root.current!, text = copy.current!, veil = shade.current!
    const scroller = hero.closest<HTMLElement>('.overlay-scroll')
    let timeline: gsap.core.Timeline | undefined
    const draw = (instant = false) => {
      timeline?.kill()
      const closed = Math.max(220, text.offsetHeight + 116)
      const expanded = Math.max(closed + 100, Math.min((scroller?.clientHeight || window.innerHeight) * .82, 720))
      const targets = { height: open ? expanded : closed, y: open ? expanded - closed : 0, scale: open ? .86 : 1 }
      if (instant || reduced || !initialized.current) {
        gsap.set(hero, { height: targets.height })
        gsap.set(text, { y: targets.y, scale: targets.scale })
        gsap.set(veil, { opacity: open ? .12 : .86 })
        if (arrows.current) gsap.set(arrows.current, { opacity: open ? 1 : 0 })
      } else {
        timeline = gsap.timeline({ defaults: { duration: .5, ease: 'power2.inOut' } })
          .to(hero, { height: targets.height }, 0)
          .to(text, { y: targets.y, scale: targets.scale }, 0)
          .to(veil, { opacity: open ? .12 : .86 }, 0)
        if (arrows.current) timeline.to(arrows.current, { opacity: open ? 1 : 0, duration: .25 }, open ? .18 : 0)
      }
      initialized.current = true
    }
    draw()
    const resize = () => draw(true)
    let dimensions = `${text.offsetWidth}:${text.offsetHeight}:${scroller?.clientHeight}`
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(() => {
      const next = `${text.offsetWidth}:${text.offsetHeight}:${scroller?.clientHeight}`
      if (next !== dimensions) { dimensions = next; resize() }
    })
    if (scroller) observer?.observe(scroller)
    observer?.observe(text)
    window.addEventListener('resize', resize)
    return () => { timeline?.kill(); observer?.disconnect(); window.removeEventListener('resize', resize) }
  }, [open, reduced])

  useLayoutEffect(() => {
    const nodes = root.current!.querySelectorAll<HTMLElement>('[data-gallery-image]')
    const current = root.current!.querySelector<HTMLElement>(`[data-gallery-image="${index}"]`)
    const others = [...nodes].filter(node => node !== current)
    if (reduced) { if (others.length) gsap.set(others, { opacity: 0 }); if (current) gsap.set(current, { opacity: 1 }); return }
    const timeline = gsap.timeline()
    if (others.length) timeline.to(others, { opacity: 0, duration: .3 }, 0)
    if (current) timeline.to(current, { opacity: 1, duration: .3 }, 0)
    return () => { timeline.kill() }
  }, [index, visited, reduced])

  const navigate = (direction: number) => {
    const next = (index + direction + images.length) % images.length
    setVisited(current => new Set([...current, next])); setIndex(next)
  }
  const active = images[index]
  return <div className="hero-gallery" ref={root} data-open={open} onKeyDown={event => {
    if (!open || !['ArrowLeft', 'ArrowRight'].includes(event.key) || !(event.target instanceof HTMLButtonElement)) return
    event.preventDefault(); event.stopPropagation(); navigate(event.key === 'ArrowRight' ? 1 : -1)
  }}>
    <div className="hero-gallery-visual" id={id} role="group" aria-label={`Galerie de ${title}`}>
      {images.map((image, position) => visited.has(position) && <img key={image.src} data-gallery-image={position} src={image.src} alt={image.alt} aria-hidden={position !== index} className={failed.has(position) ? 'gallery-image-failed' : ''} decoding="async" onError={() => setFailed(current => new Set([...current, position]))} />)}
      <div className="hero-gallery-shade" ref={shade} />
      <div className="hero-gallery-text-shade" />
    </div>
    <div className="hero-gallery-toolbar"><p className="study-kicker">01 — ÉTUDE DE PROJET</p><button ref={toggle} type="button" className="hero-gallery-toggle" aria-expanded={open} aria-controls={id} onClick={() => open ? close() : setOpen(true)}><Images size={15} aria-hidden="true" />{open ? 'Fermer la galerie' : 'Voir la galerie'}</button></div>
    <div ref={copy} className="hero-gallery-copy"><Heading title={title} signature={signature} /></div>
    {images.length > 1 && <div className="hero-gallery-arrows" ref={arrows} aria-hidden={!open}><button type="button" disabled={!open} aria-label="Image précédente" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button><button type="button" disabled={!open} aria-label="Image suivante" onClick={() => navigate(1)}><ArrowRight size={20} /></button></div>}
    {open && <div className="hero-gallery-counter" aria-hidden="true">{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</div>}
    {open && active.caption && <p className="hero-gallery-caption">{active.caption}</p>}
    {failed.has(index) && <p className="hero-gallery-error" role="status">Image indisponible. {images.length > 1 ? 'Vous pouvez consulter les autres captures.' : 'Vous pouvez poursuivre la lecture de la fiche.'}</p>}
    <span className="hero-gallery-sr" role="status" aria-live="polite">{open ? `Image ${index + 1} sur ${images.length} : ${active.alt}` : ''}</span>
  </div>
}
