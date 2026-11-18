import type { Project } from './types'
import gallery01 from '../../assets/noven/gallery-01.png'
import gallery02 from '../../assets/noven/gallery-02.png'

export const noven: Project = {
  id: 'noven',
  title: 'Noven',
  category: 'Veille personnelle intelligente',
  status: 'En développement',
  summary: 'Application de veille personnelle présentée comme un magazine numérique.',
  featured: true,
  signature: "L'information qui compte, sans le bruit.",
  team: 'Trois développeurs',
  featuredContent: {
    hook: 'Une plateforme de veille personnelle qui vise à transformer des informations dispersées en un magazine numérique personnalisé, pertinent et vérifiable.',
    role: "Conception produit, architecture métier, évaluation des sujets, vérification de l'information et UX/UI.",
    technologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
  },
  description: "Noven est une application de veille personnelle conçue pour aider chacun à suivre les sujets qui l'intéressent sans multiplier les sources d'information.\n\nLe projet vise à réunir les nouveautés pertinentes dans un magazine numérique personnalisé, avec une lecture progressive et un accès aux sources utilisées.",
  problem: "Suivre efficacement un sujet demande de consulter différentes sources : sites spécialisés, médias, réseaux sociaux, publications officielles et communautés.\n\nL'information est dispersée, parfois répétitive et difficile à vérifier. L'utilisateur doit rechercher lui-même les nouveautés importantes, distinguer les reprises et retrouver les éléments nécessaires à leur compréhension.\n\nNoven cherche à réduire cet effort et à proposer une expérience de veille mieux adaptée à l'attention de l'utilisateur.",
  solution: "Noven propose une expérience organisée autour des sujets définis par l'utilisateur.\n\nLe système vise à identifier les nouveautés pertinentes, limiter les répétitions, rechercher les informations nécessaires à leur vérification et les présenter dans un magazine numérique.\n\nLa lecture est pensée de manière progressive : une synthèse permet de comprendre l'essentiel, tandis que des niveaux de détail donnent accès au contexte, aux nuances et aux sources.\n\nL'utilisateur doit pouvoir contrôler le rythme et le volume de sa veille.\n\nCette expérience constitue l'objectif produit visé : elle n'est pas encore entièrement implémentée.",
  features: [
    'Socle de collecte RSS/Atom et de lecture de pages web.',
    'Normalisation et conservation des documents.',
    'Mécanismes de dédoublonnage et de suivi des événements.',
    'Infrastructure de traitements asynchrones.',
    'Contrats métier partagés avec validation.',
    "Première implémentation du mécanisme d'évaluation des sujets à l'aide d'un modèle de langage, encore en validation.",
  ],
  architecture: "Noven repose sur un monorepo TypeScript composé de modules indépendants.\n\nUne API Express expose les services applicatifs, tandis que des workers exécutent les traitements asynchrones avec BullMQ et Redis.\n\nPostgreSQL et Drizzle ORM assurent la persistance. Les contrats partagés avec Zod permettent de valider les données échangées entre les modules.\n\nUne architecture de files de messages et d'outbox transactionnelle contribue à la cohérence et à la reprise des traitements.",
  contribution: "Je développe Noven au sein d'une équipe de trois personnes, avec une responsabilité particulière sur la cohérence métier et l'expérience utilisateur.\n\nMon périmètre couvre la définition des contrats partagés, l'évaluation et la précision des sujets, la conception des mécanismes de recherche et de vérification, l'édition des informations ainsi que l'UX/UI.\n\nJ'interviens dans les arbitrages métier, la conception des parcours et le développement du mécanisme d'évaluation des sujets.\n\nCertaines de ces responsabilités correspondent à des modules encore en développement.",
  challenges: [
    'Définir des contrats cohérents entre des modules développés en parallèle.',
    'Concevoir des traitements asynchrones avec reprise et idempotence.',
    'Distinguer les affirmations non vérifiées des affirmations contredites.',
    'Éviter de présenter des seuils de pertinence empiriques comme des résultats calibrés.',
    "Concilier la complexité du traitement de l'information avec une expérience de lecture simple.",
  ],
  achievements: "Le projet possède un socle technique structuré comprenant une API, des contrats partagés, des migrations, des workers, des files de traitements et des composants de collecte.\n\nDes mécanismes de normalisation, de regroupement et de gestion des événements ont été développés.\n\nL'évaluation des sujets a fait l'objet d'une première implémentation et d'essais réels, avec des corrections encore nécessaires.\n\nLa chaîne complète de veille et l'interface du magazine ne sont pas encore livrées.",
  nextSteps: [
    "Finaliser l'intégration de l'évaluation des sujets.",
    'Développer les mécanismes de recherche et de vérification.',
    "Implémenter l'édition et le versionnement des articles.",
    "Développer l'interface du magazine.",
    'Valider la chaîne complète sur des sources réelles.',
    'Préparer une version utilisable par des testeurs.',
  ],
  cover: gallery01,
  gallery: [
    { src: gallery01, alt: 'Aperçu de Noven — vue 1' },
    { src: gallery02, alt: 'Aperçu de Noven — vue 2' },
  ],
  technologies: ['TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Drizzle ORM', 'Redis', 'BullMQ', 'Zod', 'OpenAPI'],
  links: { github: 'https://github.com/Tranck04/Noven' },
  githubPublic: false,
}
