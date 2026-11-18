// @vitest-environment happy-dom
import { afterEach, expect, it } from 'vitest'
import { getScrollRegionFromEvent } from './scrollRegions'

afterEach(() => { document.body.innerHTML = '' })

it('returns the closest scroll region ancestor of the event origin', () => {
  document.body.innerHTML = '<main><div id="region" data-scroll-region><p id="target">Texte</p></div></main>'
  const target = document.getElementById('target')!
  const event = new WheelEvent('wheel', { bubbles: true })
  target.dispatchEvent(event)
  expect(getScrollRegionFromEvent(event)?.id).toBe('region')
})

it('returns null when the event originates outside any region', () => {
  document.body.innerHTML = '<main><p id="target">Texte</p></main>'
  const target = document.getElementById('target')!
  const event = new WheelEvent('wheel', { bubbles: true })
  target.dispatchEvent(event)
  expect(getScrollRegionFromEvent(event)).toBeNull()
})

it('favours the innermost region when regions are nested', () => {
  document.body.innerHTML = '<main><div id="outer" data-scroll-region><div id="inner" data-scroll-region><button id="target">Bouton</button></div></div></main>'
  const target = document.getElementById('target')!
  const event = new WheelEvent('wheel', { bubbles: true })
  target.dispatchEvent(event)
  expect(getScrollRegionFromEvent(event)?.id).toBe('inner')
})
