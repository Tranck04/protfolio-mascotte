import type { Project } from './types'
import gallery01 from '../../assets/lifehub/gallery-01.png'
import gallery02 from '../../assets/lifehub/gallery-02.png'

export const lifehub: Project = {
  id: 'lifehub',
  title: 'LifeHub',
  category: 'Système adaptatif · Productivité',
  status: 'MVP fonctionnel — en évolution',
  featured: true,
  summary: "Un copilote personnel qui adapte les tâches à l'énergie et au contexte pour proposer une prochaine action réalisable.",
  signature: 'La bonne action, au bon moment.',
  team: 'Projet personnel',
  featuredContent: {
    role: 'Conception produit, architecture et développement full-stack',
  },
  description: "LifeHub est une application personnelle de gestion adaptative des tâches, conçue pour aider les utilisateurs à passer à l'action en tenant compte de leur énergie, de leurs priorités et de leur historique.\n\nContrairement à une liste de tâches traditionnelle, LifeHub ne cherche pas à afficher tout ce qui reste à accomplir. Il propose une seule action réalisable à un instant donné, accompagnée d'une explication.\n\nLe principe central est d'adapter l'action à la personne plutôt que de demander à la personne de s'adapter systématiquement à la tâche.",
  problemTitle: 'Savoir quoi faire ne suffit pas toujours pour agir.',
  problem: "Les applications de productivité traditionnelles organisent principalement les tâches selon les échéances, les catégories ou les priorités.\n\nMais une même personne ne dispose pas toujours de la même énergie pour accomplir une activité. Une tâche importante peut rester bloquée parce que l'effort nécessaire pour commencer semble trop élevé.\n\nLifeHub explore une autre approche : intégrer la capacité d'action du moment dans le processus de décision.",
  solutionTitle: 'Un moteur qui adapte les recommandations au contexte.',
  solution: "LifeHub évalue les tâches à partir de plusieurs dimensions : urgence, impact, charge mentale, énergie actuelle, stagnation et historique des interactions.\n\nLe moteur attribue un score aux actions éligibles afin de proposer une prochaine étape pertinente.\n\nLorsqu'une tâche paraît trop exigeante, le système peut proposer une version plus accessible grâce à une cascade de réduction : FULL → MICRO → NANO.\n\nL'objectif est de faciliter le passage à l'action sans transformer les refus ou les périodes d'inactivité en source de culpabilisation.",
  features: [
    "Moteur de recommandation — sélection des actions à partir de critères contextuels, notamment l'urgence, l'impact et l'adéquation énergie–charge.",
    "Sessions adaptatives — cascade FULL → MICRO → NANO permettant de réduire progressivement la difficulté d'une action.",
    "Justification des recommandations — explication « Pourquoi maintenant ? », avec intégration d'un modèle de langage et mécanisme de fallback par templates.",
    'Gestion et capture des tâches — création, organisation, consultation et suivi des actions.',
    'Agrégation des tâches externes — connecteurs Google Calendar, Todoist et Gmail, avec synchronisation des informations.',
    "Suivi et notifications — visualisation du rythme d'activité et notifications Web Push avec limitation de fréquence.",
    'Application web progressive — interface responsive, thèmes clair et sombre, installation PWA et mode hors ligne partiel.',
  ],
  architecture: "LifeHub repose sur une architecture séparant le frontend React/TypeScript d'un backend développé avec Python et FastAPI.\n\nLe backend organise les responsabilités entre un moteur de scoring indépendant des accès aux données, des services métier, une couche de persistance et des connecteurs vers des services externes.\n\nCette séparation permet de tester la logique décisionnelle indépendamment de l'interface et de faire évoluer les modules sans modifier le fonctionnement fondamental du moteur.",
  contribution: "LifeHub est un projet personnel dans lequel j'explore la conception de systèmes logiciels capables d'adapter leur comportement aux besoins et au contexte des utilisateurs.\n\nJ'ai travaillé sur la conception du modèle décisionnel, le développement du moteur de recommandation, l'architecture applicative et le développement full-stack de la plateforme.\n\nLe projet combine une logique de décision explicable, des mécanismes d'adaptation progressive et une expérience utilisateur centrée sur une prochaine action concrète.\n\nJ'ai également travaillé sur l'intégration des différents services, la structuration des modules et la documentation technique du système.",
  challenges: [
    "Modéliser la capacité d'action — transformer des critères subjectifs, comme l'énergie et la charge mentale, en variables utilisables par un moteur de décision. Décision : une logique de scoring explicable, avec normalisation des variables et facteur d'adéquation énergie–charge.",
    "Réduire la difficulté d'une tâche — une tâche peut être prioritaire sans être réalisable immédiatement dans son intégralité. Décision : implémenter la cascade FULL → MICRO → NANO.",
    "Encadrer le rôle de l'IA — éviter que la sélection des actions dépende exclusivement d'un modèle de langage. Décision : conserver un moteur de décision déterministe et utiliser l'IA notamment pour produire des explications et assister certaines interactions.",
    "Éviter les pénalités permanentes — un historique de refus peut aider à personnaliser les propositions, mais il ne doit pas enfermer l'utilisateur dans ses comportements passés. Décision : intégrer des mécanismes d'atténuation des pénalités et d'exploration contrôlée.",
    "Conserver une architecture testable — la logique décisionnelle doit pouvoir être testée sans dépendre de l'API, de la base de données ou de l'interface. Décision : isoler le moteur de scoring dans des fonctions Python indépendantes des opérations d'entrée/sortie.",
  ],
  achievements: "LifeHub possède une application frontend React, un backend FastAPI, un moteur de scoring indépendant, plusieurs services métier et des intégrations externes.\n\nLa documentation du projet fait état de 312 tests backend réussis, d'une vingtaine de pages ou vues frontend et d'environ 40 endpoints.\n\nLe moteur de décision, les sessions adaptatives et les principaux parcours disposent d'une implémentation.\n\nLe projet constitue un MVP technique fonctionnel, dont l'évolution se poursuit.",
  nextSteps: [
    'Développer un planificateur de journée tenant compte des créneaux disponibles.',
    'Approfondir la personnalisation des recommandations.',
    "Explorer la prédiction de l'énergie.",
    'Ajouter des tests de bout en bout.',
    "Consolider les migrations, l'infrastructure et la sécurité.",
  ],
  cover: gallery01,
  gallery: [
    { src: gallery01, alt: 'Aperçu de LifeHub — vue 1' },
    { src: gallery02, alt: 'Aperçu de LifeHub — vue 2' },
  ],
  technologies: ['React', 'Python', 'FastAPI', 'TypeScript', 'Vite', 'Tailwind CSS', 'SQLAlchemy', 'PostgreSQL', 'SQLite', 'Redis', 'JWT', 'Google OAuth', 'Groq', 'API compatibles OpenAI', 'Render', 'Netlify', 'Web Push'],
  links: { github: 'https://github.com/Tranck04/lifehub-concours' },
  githubPublic: false,
}
