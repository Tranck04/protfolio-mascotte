import type { Project } from './types'
import buste from '../../assets/l0_figma_favicons_png/l0-buste-512.png'
import face from '../../assets/l0_figma_favicons_png/l0-face-512.png'
import tile from '../../assets/l0_figma_favicons_png/l0-tile-512.png'

export const lAnimations: Project = {
  id: 'l-animations',
  title: 'L° Animations',
  category: 'Animation SVG et bibliothèque de composants',
  status: 'Développement entamé',
  featured: false,
  summary: 'Bibliothèque de composants et d’animations SVG en cours de développement.',
  cover: buste,
  gallery: [
    { src: face, alt: 'Icône L° Animations — visage' },
    { src: tile, alt: 'Icône L° Animations — tuile' },
  ],
  technologies: ['SVG'],
  links: { github: 'https://github.com/Tranck04/L0-animations' },
  githubPublic: true,
}
