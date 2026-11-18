import gsap from 'gsap'
import type { MascotController, MascotExpression } from './types'

/** Intentions contextuelles déclenchées par l'interface, traduites par le contrôleur. */
export type MascotReaction = 'clicked' | 'cv-download' | 'email-copied' | 'email-opened'

type ReactionPlan = {
  expression: MascotExpression
  duration: number
  rotation: number
  scaleX: number
  scaleY: number
}

/** Trois variations légères et déterministes pour un clic direct sur Bloub. */
const CLICK_PLANS: readonly ReactionPlan[] = [
  { expression: 'surpris', duration: 0.7, rotation: 0, scaleX: 1.09, scaleY: 0.9 },
  { expression: 'heureux', duration: 0.8, rotation: 6, scaleX: 1, scaleY: 1 },
  { expression: 'curieux', duration: 0.75, rotation: -7, scaleX: 1, scaleY: 1 },
]

const PLANS: Record<Exclude<MascotReaction, 'clicked'>, ReactionPlan> = {
  'cv-download': { expression: 'excite', duration: 0.9, rotation: 0, scaleX: 1.1, scaleY: 0.88 },
  'email-copied': { expression: 'heureux', duration: 0.7, rotation: 0, scaleX: 1.06, scaleY: 0.94 },
  'email-opened': { expression: 'fier', duration: 1, rotation: 9, scaleX: 1, scaleY: 1 },
}

export interface MascotReactionHandle {
  dispatch: (reaction: MascotReaction) => boolean
  cancel: () => void
  dispose: () => void
}

/**
 * Traduit les intentions en courtes réactions sur le contrôleur existant.
 *
 * Le contrôleur reste l'unique source d'animation : ce module ne touche que
 * `pose` (rotation et échelle) et `express`, et ramène toujours la mascotte à son
 * état neutre. Les transitions de scène restent prioritaires : `canReact` les
 * écarte, et `cancel` restaure proprement la pose quand une transition démarre.
 * `prefers-reduced-motion` ne conserve qu'un discret changement d'expression.
 */
export function createMascotReactions({ mascot, reduced, canReact }: {
  mascot: MascotController
  reduced: () => boolean
  canReact: () => boolean
}): MascotReactionHandle {
  let animation: gsap.core.Timeline | null = null
  let clickIndex = 0
  const rest = { rotation: 0, scaleX: 1, scaleY: 1 }

  const settle = () => {
    Object.assign(mascot.pose, rest)
    mascot.express('neutre', reduced() ? mascot.time - 1 : mascot.time)
    mascot.render(mascot.time)
  }
  const stop = () => { if (animation) { animation.kill(); animation = null } }

  const dispatch = (reaction: MascotReaction): boolean => {
    if (!canReact()) return false
    stop()
    rest.rotation = mascot.pose.rotation
    rest.scaleX = mascot.pose.scaleX
    rest.scaleY = mascot.pose.scaleY
    const plan = reaction === 'clicked' ? CLICK_PLANS[clickIndex++ % CLICK_PLANS.length]! : PLANS[reaction]
    const isReduced = reduced()
    // Reach the target expression immediately; reduced motion snaps instead of morphing.
    mascot.express(plan.expression, isReduced ? mascot.time - 1 : mascot.time)
    if (isReduced) {
      mascot.render(mascot.time)
      animation = gsap.timeline({ onComplete: () => { animation = null; settle() } })
        .call(() => { mascot.express('neutre', mascot.time - 1); mascot.render(mascot.time) }, [], Math.max(0.35, plan.duration * 0.6))
      return true
    }
    const out = plan.duration * 0.38
    animation = gsap.timeline({ onComplete: () => { animation = null; settle() } })
      .to(mascot.pose, { rotation: plan.rotation, scaleX: plan.scaleX, scaleY: plan.scaleY, duration: out, ease: 'power2.out' }, 0)
      .to(mascot.pose, { rotation: rest.rotation, scaleX: rest.scaleX, scaleY: rest.scaleY, duration: plan.duration - out, ease: 'elastic.out(1, 0.55)' }, out)
      .call(() => mascot.express('neutre', mascot.time), [], plan.duration * 0.72)
    return true
  }

  return {
    dispatch,
    cancel: () => { stop(); settle() },
    dispose: () => { stop(); settle() },
  }
}
