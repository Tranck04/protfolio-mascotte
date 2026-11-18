// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import { createMascotReactions } from './reactions'
import type { MascotController } from './types'

function fake() {
  const pose = { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 }
  const express = vi.fn()
  const render = vi.fn()
  const controller: MascotController = {
    time: 4,
    pose,
    setShape: vi.fn(),
    express,
    moveTo: vi.fn(),
    rotateTo: vi.fn(),
    lookAt: vi.fn(),
    lookAway: vi.fn(),
    setIdle: vi.fn(),
    reset: vi.fn(),
    render,
  }
  return { controller, pose, express, render }
}

afterEach(() => { gsap.globalTimeline.clear() })

it('cycles the three click variations in a deterministic order', () => {
  const { controller, express } = fake()
  const handle = createMascotReactions({ mascot: controller, reduced: () => false, canReact: () => true })
  handle.dispatch('clicked'); handle.dispatch('clicked'); handle.dispatch('clicked')
  expect(express.mock.calls.map(call => call[0])).toEqual(['surpris', 'heureux', 'curieux'])
  handle.dispose()
})

it('ignores a reaction while a transition owns the mascot', () => {
  const { controller, express } = fake()
  const handle = createMascotReactions({ mascot: controller, reduced: () => false, canReact: () => false })
  expect(handle.dispatch('cv-download')).toBe(false)
  expect(express).not.toHaveBeenCalled()
  handle.dispose()
})

it('maps each contextual intent to a distinct expression and returns to neutral', () => {
  const { controller, express, pose } = fake()
  const handle = createMascotReactions({ mascot: controller, reduced: () => true, canReact: () => true })
  expect(handle.dispatch('cv-download')).toBe(true)
  expect(express).toHaveBeenCalledWith('excite', expect.any(Number))
  handle.dispose()
  expect(express).toHaveBeenLastCalledWith('neutre', expect.any(Number))
  expect(pose.rotation).toBe(0)
})

it('restores the pose and neutral expression when cancelled', () => {
  const { controller, express, pose } = fake()
  const handle = createMascotReactions({ mascot: controller, reduced: () => false, canReact: () => true })
  handle.dispatch('email-opened')
  pose.rotation = 9
  handle.cancel()
  expect(pose.rotation).toBe(0)
  expect(express).toHaveBeenLastCalledWith('neutre', expect.any(Number))
})
