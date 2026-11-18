import type { ExpressionId } from './vendor/expressions'
import type { ShapeId } from './vendor/skins'

export type MascotExpression = ExpressionId | 'wink' | 'idle'
export interface MascotPose { x: number; y: number; rotation: number; scale: number; scaleX: number; scaleY: number; opacity: number }
/** A scene knows this interface, never the SVG or Bloub's engine. Time is in seconds. */
export interface MascotController {
  readonly time: number
  pose: MascotPose
  setShape(shape: ShapeId, at: number): void
  express(expression: MascotExpression, at: number): void
  moveTo(x: number, y: number): void
  rotateTo(degrees: number): void
  lookAt(clientX: number, clientY: number): void
  lookAway(): void
  setIdle(enabled: boolean): void
  reset(): void
  render(at: number): void
}
