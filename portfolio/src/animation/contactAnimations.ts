import gsap from 'gsap'

/** The persistent mascot is exclusively animated by the shared scene timeline. */
export function createContactEntrance(root: HTMLElement, reduced: boolean) {
  return gsap.context(() => {
    if (reduced) return
    const elements = root.querySelectorAll('[data-contact-enter]')
    if (elements.length) gsap.fromTo(elements, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4, stagger: .06, delay: .22, ease: 'power2.out' })
  }, root)
}
