import { BotEngine } from './vendor/engine'
import { EXPRESSION_BY_ID } from './vendor/expressions'
import { SHAPE_BY_ID } from './vendor/skins'
import type { MascotController } from './types'

export function createBloubController(root: HTMLDivElement, svg: SVGSVGElement): MascotController {
  let engine = new BotEngine(100, 'idle', SHAPE_BY_ID.get('nuage')!.radii)
  let idle = false
  let frozenTime = 0
  let latestTime = 0
  const body = svg.querySelector<SVGPathElement>('[data-body]')!
  const silhouette = svg.querySelector<SVGPathElement>('[data-silhouette]')!
  const eyes = [...svg.querySelectorAll<SVGPathElement>('[data-eye]')]
  const pose = { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 0 }
  return {
    get time() { return latestTime },
    pose,
    setShape(shape, at) { engine.setShape(SHAPE_BY_ID.get(shape)!.radii, at) },
    express(expression, at) {
      if (expression === 'wink' || expression === 'idle') engine.setState(expression, at)
      else engine.setExpression(EXPRESSION_BY_ID.get(expression)!, at)
    },
    moveTo(x, y) { pose.x = x; pose.y = y },
    rotateTo(degrees) { pose.rotation = degrees },
    setIdle(enabled) { if (idle && !enabled) frozenTime = latestTime; idle = enabled },
    reset() { engine = new BotEngine(100, 'idle', SHAPE_BY_ID.get('nuage')!.radii); idle = true; frozenTime = 0 },
    lookAt(clientX, clientY) {
      const rect = root.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return
      const dx = clientX - (rect.left + rect.width / 2)
      const dy = clientY - (rect.top + rect.height / 2)
      const r = rect.width / 2
      const norm = (n: number) => Math.max(-1, Math.min(1, n))
      engine.setLook({ yaw: norm(dx / (r * 3)) * 36, pitch: norm(-dy / (r * 3)) * 30, mix: 1, spin: 0, wander: 0 }, latestTime)
    },
    lookAway() { engine.setLook(null, latestTime) },
    render(at) {
      latestTime = at
      const frame = engine.sample(idle ? at : frozenTime)
      body.setAttribute('d', frame.bodyPath)
      silhouette.setAttribute('d', frame.bodyPath)
      frame.eyes.forEach((eye, i) => {
        eyes[i].setAttribute('d', eye.d)
        eyes[i].setAttribute('transform', eye.matrix)
        eyes[i].setAttribute('opacity', String(eye.alpha))
      })
      eyes.forEach((eye, i) => { if (!frame.eyes[i]) eye.setAttribute('opacity', '0') })
      root.style.transform = `translate3d(${pose.x}px,${pose.y}px,0) translate(-50%,-50%) rotate(${pose.rotation}deg) scale(${pose.scale * pose.scaleX},${pose.scale * pose.scaleY})`
      root.style.opacity = String(pose.opacity)
    },
  }
}
