import gsap from 'gsap'
import type { MascotController } from '../mascot/types'

export function createContactEntrance(root: HTMLElement, reduced: boolean) {
  return gsap.context(() => {
    if (reduced) return
    const timeline = gsap.timeline()
      .fromTo(root.querySelector('.contact-letter'), { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: .55, ease: 'power2.out' }, .28)
    const fields = root.querySelectorAll('.letter-intro, .contact-field, .contact-letter-actions')
    if (fields.length) timeline.fromTo(fields, { opacity: 0, y: 7 }, { opacity: 1, y: 0, duration: .3, stagger: .045, ease: 'power2.out' }, .45)
  }, root)
}
export function createLetterConfirmation(root: HTMLElement, reduced: boolean) {
  return gsap.context(() => {
    if (reduced) return
    gsap.timeline()
      .fromTo(root, { scaleY: .96, transformOrigin: '50% 0%' }, { scaleY: 1, duration: .38, ease: 'power2.out' }, 0)
      .fromTo(root.querySelector('.contact-confirmation'), { opacity: 0, y: -7 }, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, .05)
  }, root)
}
/** Only called after the submission service explicitly acknowledges the message. */
export function celebrateContact(mascot: MascotController, reduced: boolean) {
  if (reduced) return () => {}
  mascot.express('wink', mascot.time)
  const restore = () => mascot.express('idle', mascot.time)
  const reaction = gsap.delayedCall(.85, restore)
  return () => { reaction.kill(); restore() }
}
