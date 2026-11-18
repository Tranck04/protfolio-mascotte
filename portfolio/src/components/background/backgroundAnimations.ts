import type gsap from 'gsap'
import type { Scene } from '../FloatingNavigation'
import { backgroundPath, backgroundShapes, interpolateBackground, sceneBackgrounds } from './backgroundShapes'

type BackgroundTimeline = ReturnType<typeof gsap.timeline>
type BackgroundTween = ReturnType<typeof gsap.to>
export type BackgroundController = {
  appendTo: (timeline: BackgroundTimeline, scene: Scene, duration: number) => void
  settle: (scene: Scene) => void
  dispose: () => void
}

/** This controller owns no clock: its only tween belongs to the existing scene timeline. */
export function createBackgroundController(path: SVGPathElement): BackgroundController {
  let current = backgroundShapes.circle
  let tween: BackgroundTween | undefined
  let disposed = false
  let generation = 0
  const render = (points: typeof current) => { current = points; path.setAttribute('d', backgroundPath(points)) }
  const cancel = () => { generation++; tween?.kill(); tween = undefined }
  render(current)
  return {
    appendTo(timeline, scene, duration) {
      if (disposed) return
      cancel()
      const from = current
      const to = backgroundShapes[sceneBackgrounds[scene]]
      const token = generation
      const progress = { t: 0 }
      timeline.to(progress, {
        t: 1, duration: duration * .75, ease: 'power2.inOut',
        onUpdate() { if (!disposed && generation === token) render(interpolateBackground(from, to, progress.t)) },
      }, duration * .1)
      tween = timeline.recent() as BackgroundTween
    },
    settle(scene) { if (!disposed) { cancel(); render(backgroundShapes[sceneBackgrounds[scene]]) } },
    dispose() { disposed = true; cancel() },
  }
}
