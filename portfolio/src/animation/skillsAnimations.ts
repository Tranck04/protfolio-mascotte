import gsap from 'gsap'
import { RADAR, polygonPoints } from '../components/skills/radarGeometry'

/** The radar owns its entrance; scene movement and mascot timelines remain independent. */
export function createSkillsEntrance(root: HTMLElement, finalPolygon: string, reduced: boolean) {
  return gsap.context(() => {
    if (reduced) return
    const polygon = root.querySelector('[data-radar-values]')!
    const centre = polygonPoints(Array.from({ length: 5 }, () => ({ x: RADAR.cx, y: RADAR.cy })))
    gsap.timeline()
      .fromTo(root.querySelector('.skills-radar-svg'), { opacity: 0 }, { opacity: 1, duration: .25 }, .08)
      .fromTo(root.querySelectorAll('.radar-grid, .radar-spoke'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: .018, duration: .4, ease: 'power2.out' }, .15)
      .fromTo(polygon, { attr: { points: centre } }, { attr: { points: finalPolygon }, duration: .55, ease: 'power3.out' }, .3)
      .fromTo(root.querySelectorAll('.radar-point-group'), { opacity: 0 }, { opacity: 1, stagger: .04, duration: .22 }, .6)
      .fromTo(root.querySelectorAll('.radar-axis-label'), { opacity: 0, y: 5 }, { opacity: 1, y: 0, stagger: .025, duration: .24, ease: 'power2.out' }, .65)
      .fromTo(root.querySelector('.skill-details'), { opacity: 0, y: 7 }, { opacity: 1, y: 0, duration: .35 }, .3)
  }, root)
}
