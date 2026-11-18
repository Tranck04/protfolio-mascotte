import { BotEngine } from './vendor/engine'
import type { ShapeId } from './vendor/skins'

/** Content scenes that own a body shape. The introduction keeps its own nuage → cercle sequence. */
export type ShapeScene = 'hero' | 'projects' | 'journey' | 'skills' | 'contact'

/**
 * Single source of truth for the contextual silhouette. Scene components never
 * decide a shape themselves: the transition controller asks for this mapping.
 */
export const SCENE_SHAPES: Record<ShapeScene, ShapeId> = {
  hero: 'cercle',
  projects: 'squircle',
  journey: 'triangle',
  skills: 'hexagone',
  contact: 'nuage',
}

/** The engine's own morph length, reused so the tween and the morph finish together. */
export const SHAPE_MORPH_DURATION = BotEngine.SHAPE_MORPH

export const sceneShape = (scene: ShapeScene): ShapeId => SCENE_SHAPES[scene]
