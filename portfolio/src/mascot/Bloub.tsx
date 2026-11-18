import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useId } from 'react'
import type { KeyboardEvent } from 'react'
import { createBloubController } from './controller'
import type { MascotController } from './types'
import type { MascotReaction } from './reactions'

export type BloubProps = { interactive?: boolean; onReact?: (reaction: MascotReaction) => void }

/** React rendering adapter for the upstream, framework-free engine. One persistent SVG. */
export const Bloub = forwardRef<MascotController, BloubProps>(function Bloub({ interactive = false, onReact }, ref) {
  const root = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const controller = useRef<MascotController | null>(null)
  const id = useId().replace(/:/g, '')
  useLayoutEffect(() => {
    controller.current = createBloubController(root.current!, svg.current!)
    return () => { controller.current = null }
  }, [])
  useImperativeHandle(ref, () => controller.current!, [])
  const activate = () => onReact?.('clicked')
  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') { event.preventDefault(); activate() }
  }
  return <div className={`mascot${interactive ? ' is-interactive' : ''}`} ref={root}
    aria-hidden={!interactive}
    role={interactive ? 'button' : undefined}
    tabIndex={interactive ? 0 : undefined}
    aria-label={interactive ? 'Faire réagir Bloub' : undefined}
    onClick={interactive ? activate : undefined}
    onKeyDown={interactive ? keydown : undefined}>
    <svg ref={svg} viewBox="-110 -110 220 220" focusable="false" aria-hidden="true">
      <defs><mask id={id} maskUnits="userSpaceOnUse" x="-110" y="-110" width="220" height="220">
        <path data-silhouette="" fill="#fff" />
        <path data-eye="" fill="#000" /><path data-eye="" fill="#000" />
      </mask></defs>
      <path data-body="" className="mascot-eye-backing" />
      <rect x="-110" y="-110" width="220" height="220" fill="var(--color-signal)" mask={`url(#${id})`} />
    </svg>
  </div>
})
