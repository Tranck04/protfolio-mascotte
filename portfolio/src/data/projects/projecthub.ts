import type { Project } from './types'
import gallery01 from '../../assets/projecthub/gallery-01.png'
import gallery02 from '../../assets/projecthub/gallery-02.png'

export const projecthub: Project = {
  id: 'projecthub',
  title: 'ProjectHub',
  category: 'Plateforme de gestion de projets et de ressources',
  status: 'Projet professionnel réalisé',
  featured: true,
  summary: 'Une plateforme centralisée de gestion des projets, des équipes et des ressources.',
  signature: "D'une maquette à une application métier fonctionnelle.",
  team: 'Projet collaboratif',
  featuredContent: {
    role: 'Développeur full-stack — conception et implémentation',
  },
  description: "ProjectHub est une plateforme de gestion de projets et de ressources développée dans le cadre de mon expérience professionnelle chez EMLink.\n\nÀ partir d'une première base d'interface produite avec Figma Make, j'ai pris en charge l'essentiel de la conception technique et du développement full-stack de l'application.\n\nJ'ai implémenté son backend, développé les fonctionnalités métier et réalisé une refonte du frontend initial afin de construire une plateforme cohérente et fonctionnelle.",
  problem: "La gestion opérationnelle d'un projet implique de coordonner des informations de natures différentes : activités, intervenants, échéances, budgets, documents et ressources.\n\nLorsque ces éléments sont répartis entre plusieurs outils, leur suivi devient plus complexe.\n\nLes équipes doivent naviguer entre différents espaces pour comprendre l'état d'avancement d'un projet et disposer d'une vue cohérente de leurs activités.",
  solution: "ProjectHub rassemble ces fonctions dans une plateforme modulaire.\n\nL'objectif est de permettre aux utilisateurs de piloter leurs projets, organiser les tâches, suivre les ressources et accéder aux informations nécessaires depuis un environnement centralisé.\n\nLes différents modules sont conçus pour fonctionner ensemble plutôt que comme des outils isolés.",
  features: [
    'Projets et tâches — organisation des projets, activités et responsabilités.',
    "Équipes et permissions — gestion des utilisateurs, rôles et droits d'accès.",
    'Suivi du temps et alertes — suivi des activités et gestion des échéances.',
    'Budgets — gestion des informations financières liées aux projets.',
    'Ressources — gestion des ressources humaines et matérielles.',
    'Documentation — centralisation des documents associés aux projets.',
    'Localisation — fonctionnalités de suivi géographique.',
    "Agent IA — fonctionnalités d'assistance intégrées à la plateforme.",
  ],
  architecture: "ProjectHub utilise une application frontend développée avec React, TypeScript et Vite, connectée à des services backend par API REST.\n\nLe frontend s'appuie sur une architecture modulaire inspirée des principes de séparation des responsabilités et du Domain-Driven Design.\n\nL'environnement technique du projet comprend des services backend Python, une approche microservices ainsi que Docker, Nginx et AWS EC2 pour les aspects d'hébergement et de déploiement.\n\nFirebase Authentication intervient dans la gestion de l'authentification.",
  contribution: "À partir d'une première base d'interface réalisée avec Figma Make, j'ai pris en charge l'essentiel de la conception technique et du développement full-stack de ProjectHub.\n\nMon travail s'est articulé autour de trois responsabilités principales.\n\nConception et développement backend — j'ai implémenté le backend de ProjectHub et les fonctionnalités métier nécessaires au fonctionnement de ses différents modules.\n\nRefonte et développement frontend — j'ai repris le frontend initial, repensé son implémentation et fait évoluer les interfaces pour les adapter aux fonctionnalités de l'application.\n\nIntégration et cohérence applicative — j'ai assuré l'articulation entre le frontend et le backend ainsi que la cohérence fonctionnelle des différents modules de la plateforme.\n\nCette expérience m'a amené à intervenir sur une grande partie du cycle de développement d'une application métier, depuis une première base maquettée jusqu'à son implémentation fonctionnelle.",
  challenges: [
    "Du prototype à une application fonctionnelle — transformer une base d'interface produite avec Figma Make en une véritable application métier, comprenant les traitements backend et les fonctionnalités nécessaires à son fonctionnement.",
    "Conception d'une application modulaire — structurer le développement de plusieurs domaines fonctionnels interdépendants, tout en maintenant la cohérence des données et des comportements.",
    "Refonte et cohérence frontend/backend — faire évoluer l'interface initiale et garantir l'intégration des traitements backend avec les parcours utilisateurs.",
  ],
  achievements: "ProjectHub m'a permis de prendre en charge l'essentiel du développement full-stack d'une application métier en contexte professionnel.\n\nÀ partir d'une première base d'interface, j'ai développé les fonctionnalités backend, refondu le frontend et assuré l'intégration des différents modules.\n\nCe travail m'a permis d'approfondir la conception d'applications métier, la structuration d'une architecture modulaire et la cohérence entre les différentes couches d'un système logiciel.\n\nProjectHub représente ainsi une expérience concrète de conception et de développement d'une application comportant plusieurs domaines fonctionnels.",
  finalSectionLabel: 'RÉALISATIONS & APPRENTISSAGES',
  finalSectionTitle: 'Réalisations et apprentissages.',
  finalCurrentTitle: 'Ce que cette expérience m’a apporté',
  cover: gallery01,
  gallery: [
    { src: gallery01, alt: 'Aperçu de ProjectHub — vue 1' },
    { src: gallery02, alt: 'Aperçu de ProjectHub — vue 2' },
  ],
  technologies: ['React', 'TypeScript', 'Vite', 'Python', 'REST APIs', 'Docker', 'Nginx', 'AWS EC2', 'Firebase Authentication'],
}
