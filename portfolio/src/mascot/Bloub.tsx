import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useId } from 'react'
import { createBloubController } from './controller'
import type { MascotController } from './types'

/** React rendering adapter for the upstream, framework-free engine. One persistent SVG. */
export const Bloub = forwardRef<MascotController>(function Bloub(_, ref) {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const controller = useRef<MascotController | null>(null)
  const id = useId().replace(/:/g, '')
  useLayoutEffect(() => {
    controller.current = createBloubController(root.current!, svg.current!)
    return () => { controller.current = null }
  }, [])
  useImperativeHandle(ref, () => controller.current!, [])
  return <div className="mascot" ref={root} aria-hidden="true">
    <svg ref={svg} viewBox="-110 -110 220 220" focusable="false">
      <defs><mask id={id} maskUnits="userSpaceOnUse" x="-110" y="-110" width="220" height="220">
        <path data-silhouette="" fill="#fff" />
        <path data-eye="" fill="#000" /><path data-eye="" fill="#000" />
      </mask></defs>
      <path data-body="" className="mascot-eye-backing" />
      <rect x="-110" y="-110" width="220" height="220" fill="var(--color-signal)" mask={`url(#${id})`} />
    </svg>
  </div>
})
