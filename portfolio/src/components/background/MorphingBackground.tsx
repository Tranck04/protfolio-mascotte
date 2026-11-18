import { useCallback, useId, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import type { Ref } from 'react'
import gsap from 'gsap'
import { backgroundLayout, backgroundPath, backgroundShapes, backgroundTransform } from './backgroundShapes'
import { createBackgroundController } from './backgroundAnimations'
import type { BackgroundController } from './backgroundAnimations'

const SPIN_DURATION = 120

export function MorphingBackground({ ref, reduced = false }: { ref: Ref<BackgroundController>; reduced?: boolean }) {
  const id = useId().replace(/:/g, '')
  const svg = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)
  const main = useRef<SVGGElement>(null)
  const echo = useRef<SVGGElement>(null)
  const halo = useRef<SVGEllipseElement>(null)
  const controller = useRef<BackgroundController | null>(null)
  const layout = useRef<ReturnType<typeof backgroundLayout> | null>(null)
  const angles = useRef({ main: 0, echo: 0 })
  // The spin is written into the existing SVG transform, so it turns around the contour's own origin.
  const apply = useCallback(() => {
    const composition = layout.current
    if (!composition || !main.current || !echo.current) return
    main.current.setAttribute('transform', backgroundTransform(composition.main, angles.current.main))
    echo.current.setAttribute('transform', backgroundTransform(composition.echo, angles.current.echo))
  }, [])
  useLayoutEffect(() => {
    controller.current = createBackgroundController(path.current!)
    const root = svg.current!
    const place = () => {
      const bounds = root.getBoundingClientRect()
      const width = Math.max(1, bounds.width || window.innerWidth)
      const height = Math.max(1, bounds.height || window.innerHeight)
      root.setAttribute('viewBox', `0 0 ${width} ${height}`)
      const composition = backgroundLayout(width, height)
      layout.current = composition
      apply()
      Object.entries(composition.halo).forEach(([key, value]) => halo.current!.setAttribute(key, String(value)))
    }
    place()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(place) : null
    observer?.observe(root)
    window.addEventListener('resize', place)
    return () => { observer?.disconnect(); window.removeEventListener('resize', place); controller.current?.dispose(); controller.current = null }
  }, [apply])
  useLayoutEffect(() => {
    if (reduced) {
      angles.current = { main: 0, echo: 0 }
      apply()
      return
    }
    const spin = { main: 0, echo: 0 }
    const tween = gsap.to(spin, {
      main: 360,
      echo: -360,
      duration: SPIN_DURATION,
      ease: 'none',
      repeat: -1,
      onUpdate() {
        angles.current = { main: spin.main, echo: spin.echo }
        apply()
      },
    })
    return () => {
      tween.kill()
      angles.current = { main: 0, echo: 0 }
      apply()
    }
  }, [apply, reduced])
  useImperativeHandle(ref, () => ({
    appendTo: (timeline, scene, duration) => controller.current?.appendTo(timeline, scene, duration),
    settle: scene => controller.current?.settle(scene),
    dispose: () => controller.current?.dispose(),
  }), [])
  return <svg ref={svg} className="morphing-background" aria-hidden="true" focusable="false" viewBox="0 0 1440 900" preserveAspectRatio="none">
    <defs>
      <path ref={path} id={`${id}-contour`} data-background-contour="" d={backgroundPath(backgroundShapes.circle)} />
      <radialGradient id={`${id}-halo`}><stop className="background-halo-center" offset="0" /><stop className="background-halo-edge" offset="1" /></radialGradient>
      <linearGradient id={`${id}-surface`} x1="0" y1="0" x2="1" y2="1"><stop className="background-surface-start" offset="0" /><stop className="background-surface-end" offset="1" /></linearGradient>
    </defs>
    <ellipse ref={halo} className="background-halo" cx="1382" cy="108" rx="760" ry="760" fill={`url(#${id}-halo)`} />
    <g ref={main} className="background-main" transform="translate(1397 54) scale(4.9) rotate(-12)"><use href={`#${id}-contour`} fill={`url(#${id}-surface)`} /></g>
    <g ref={echo} className="background-echo" transform="translate(22 918) scale(2.7) rotate(24)"><use href={`#${id}-contour`} fill="none" /></g>
  </svg>
}
