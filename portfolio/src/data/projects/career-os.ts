import type { Project } from './types'
import gallery01 from '../../assets/career-os/gallery-01.png'
import gallery02 from '../../assets/career-os/gallery-02.png'

export const careerOs: Project = {
  id: 'career-os',
  title: 'Career OS',
  category: 'Architecture logicielle · Gestion de carrière',
  status: 'Prototype en développement',
  featured: true,
  summary: 'Transformer ses ambitions en trajectoires concrètes.',
  signature: 'Transformer ses ambitions en trajectoires concrètes.',
  team: 'Projet personnel',
  featuredContent: {
    role: 'Conception produit, modélisation de domaine et développement',
  },
  description: "Career OS est un projet personnel de conception logicielle visant à représenter une trajectoire professionnelle comme un ensemble d'objectifs, de compétences, d'expériences, d'apprentissages et de réalisations interconnectés.\n\nL'idée est de dépasser une simple liste de tâches ou un tableau de suivi de candidatures pour construire un modèle permettant de comprendre comment les différentes actions contribuent à un objectif professionnel.\n\nLe projet sert également de terrain d'expérimentation pour la modélisation de domaine, les relations entre entités et la conception d'une architecture évolutive.",
  problemTitle: "Une carrière ne se résume pas à une liste d'objectifs.",
  problem: "Construire une trajectoire professionnelle implique de développer des compétences, réaliser des projets, acquérir des expériences et évaluer régulièrement sa progression.\n\nCes informations sont souvent dispersées entre CV, plateformes professionnelles, outils de notes et gestionnaires de tâches.\n\nIl devient alors difficile de comprendre les dépendances entre les ambitions, les acquis et les actions nécessaires pour progresser.\n\nUn objectif comme devenir ingénieur logiciel spécialisé dans un domaine ne constitue pas, à lui seul, un plan d'action exploitable.",
  solutionTitle: 'Relier les objectifs aux actions et aux preuves de progression.',
  solution: "Career OS propose une représentation structurée du développement professionnel.\n\nUn objectif peut être relié à des initiatives, des compétences à acquérir, des contenus d'apprentissage, des projets, des tâches et des jalons.\n\nLes éléments du système ne sont pas simplement enregistrés : leurs relations permettent de représenter les dépendances et les contributions à une trajectoire.\n\nL'ambition est de créer une base capable de soutenir progressivement l'analyse de progression et l'aide à la décision.",
  features: [
    'Objectifs et initiatives — représentation des ambitions professionnelles et des initiatives permettant de les poursuivre.',
    "Compétences et apprentissages — modélisation des compétences et des ressources nécessaires à leur développement.",
    "Projets et réalisations — association des projets aux objectifs et aux compétences qu'ils permettent de mobiliser.",
    'Tâches et jalons — décomposition des initiatives en étapes suivables.',
    'Preuves de progression — représentation des éléments permettant de justifier ou documenter les acquis.',
    'Relations et dépendances — modélisation des liens entre objectifs, compétences, initiatives, tâches et réalisations.',
  ],
  featuresSectionLabel: 'COMPOSANTS DU DOMAINE',
  featuresSectionTitle: 'Le domaine étudié.',
  architecture: "Career OS est développé avec React et TypeScript et repose sur une démarche de modélisation orientée domaine.\n\nLe travail de conception porte sur la définition d'entités métier, de leurs relations, des règles de cohérence et des services responsables des traitements.\n\nL'architecture étudiée distingue la logique de domaine, les services applicatifs et les mécanismes de persistance.\n\nLe projet explore également l'utilisation d'une persistance locale afin de conserver les données sans imposer immédiatement un backend distant. Des pistes comme IndexedDB et Dexie sont étudiées, sans être présentées comme une infrastructure définitivement implémentée.\n\nLes concepts et mécanismes étudiés comprennent la modélisation de domaine (Domain Modeling), le pattern repository, les relations métier, un moteur de progression (Progress Engine), un moteur d'intégrité (Integrity Engine) et la persistance locale.",
  contribution: "Career OS est un projet personnel que j'ai conçu pour expérimenter la construction d'un système métier fondé sur des entités et des relations explicites.\n\nMon travail s'est concentré sur la modélisation du domaine, la conception des relations métier, l'exploration de règles de cohérence et l'organisation de l'architecture.\n\nJ'ai également travaillé sur la construction d'une première base applicative React/TypeScript destinée à exploiter progressivement ce modèle.\n\nLe projet me permet d'approfondir la conception de systèmes logiciels où les règles métier et les dépendances entre entités occupent une place centrale.",
  challenges: [
    'Modéliser un domaine fortement interconnecté — une compétence peut contribuer à plusieurs objectifs, tandis qu’un projet peut mobiliser plusieurs compétences. Approche : représenter explicitement les relations entre entités, plutôt que disperser ces liens dans les composants d’interface.',
    'Distinguer activité et progression — terminer une tâche ne signifie pas nécessairement progresser de manière significative vers un objectif. Approche : explorer un moteur de progression prenant en compte les contributions et les dépendances entre éléments du domaine.',
    "Maintenir la cohérence du modèle — la modification ou la suppression d'une entité peut affecter plusieurs relations. Approche : étudier des règles d'intégrité indépendantes de l'interface utilisateur.",
    "Préserver l'évolutivité de l'architecture — le projet pourra progressivement intégrer des mécanismes d'analyse et d'aide à la décision. Approche : privilégier une séparation claire entre logique métier, services applicatifs et infrastructure.",
  ],
  achievements: "Career OS possède une base de développement React/TypeScript et a fait l'objet de travaux de modélisation du domaine.\n\nDes travaux antérieurs concernent les entités, leurs relations, les mécanismes de progression et d'intégrité ainsi que les possibilités de persistance locale.\n\nLe projet reste en développement. Son état fonctionnel exact devra être vérifié lorsque le code source sera de nouveau accessible.\n\nIl n'est donc pas présenté comme une plateforme complète de gestion de carrière ou comme un produit déjà commercialisé.",
  nextSteps: [
    'Exploiter le modèle métier dans des parcours utilisateurs complets.',
    'Relier les objectifs aux compétences et aux preuves de progression.',
    "Améliorer les mécanismes d'analyse et de priorisation.",
    'Développer une interface adaptée aux trajectoires professionnelles complexes.',
    "Explorer des fonctionnalités d'aide à la décision reposant sur les relations entre entités.",
  ],
  finalSectionLabel: 'ÉTAT ACTUEL & PERSPECTIVES',
  finalSectionTitle: 'État actuel et perspectives.',
  finalCurrentTitle: 'État actuel du prototype',
  cover: gallery01,
  gallery: [
    { src: gallery01, alt: 'Aperçu de Career OS — vue 1' },
    { src: gallery02, alt: 'Aperçu de Career OS — vue 2' },
  ],
  technologies: ['React', 'TypeScript', 'Vite'],
}
