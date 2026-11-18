# Portfolio — Sprints 01 à 06

React · TypeScript · Vite · GSAP · SVG · Lucide React. Interface française, thème sombre initial, thème clair et préférence de mouvement persistés localement. L’application fonctionne localement sans serveur applicatif. Le lien email ouvre directement la messagerie du visiteur ; la copie de l’adresse offre une autre option.

## Lancer

```sh
cd portfolio
npm install
npm run dev
```

Sur Windows PowerShell avec scripts désactivés, utiliser `npm.cmd` à la place de `npm`.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

## Fichiers et responsabilités

- `src/scenes/SceneManager.tsx` : scènes Introduction/Hero/Projets/Parcours/Compétences/Contact, état actif, navigation, verrouillage temporaire, suivi du regard, resize et ouverture contextuelle des projets.
- `src/scenes/ProjectsScene.tsx` : sélection, galerie secondaire et détails, transitions internes, conservation des vues et du défilement.
- `src/animation/introTimeline.ts` : timing unique, géométrie de roulade, masque du texte, arrivée synchronisée, position finale et ticker de repos.
- `src/animation/sceneTransition.ts` : transition verticale continue, déplacement courbe de Bloub, ancrages réels et trajectoire inverse.
- `src/animation/sceneGestures.ts` : molette, trackpad, clavier, tactile et arbitrage avec le défilement interne.
- `src/mascot/Bloub.tsx` : unique instance SVG persistante, adaptation React du masque original.
- `src/mascot/controller.ts`, `types.ts` : API indépendante de la scène, formes, expressions, translation, rotation et repos.
- `src/mascot/vendor/` : moteur original Bloub et ses tests, inchangés.
- `src/components/Introduction.tsx`, `Hero.tsx`, `Portrait.tsx`, `FloatingNavigation.tsx` : interface ; les coordonnées publiques fournies sont utilisées dans le portrait et Contact.
- `src/components/projects/` : cartes, galeries, `ProjectOverlay`, détails et aperçus conceptuels.
- `src/scenes/JourneyScene.tsx` : timeline, jalons alternés et révélation GSAP.
- `src/data/journey.ts` : six entrées fournies, modèle `JourneyEntry`, catégories et tri chronologique.
- `src/components/journey/JourneyPanel.tsx`, `useJourneyDetails.ts`, `panelPosition.ts` : panneau détaillé, survol/épinglage/clavier et placement adaptatif.
- `src/styles/journey.css` : scène Parcours, ligne, jalons, catégories et panneau compact mobile.
- `src/scenes/SkillsScene.tsx` : composition Compétences, état du domaine sélectionné et accès aux projets associés.
- `src/data/skills.ts` : modèle `SkillDomain`, cinq domaines, échelle qualitative et références aux projets existants.
- `src/components/skills/` : `radarGeometry`, `SkillRadar`, `useSkillSelection`, `SkillDetailPanel`, `SkillLevelLegend`.
- `src/animation/skillsAnimations.ts`, `src/styles/skills.css` : entrée synchronisée du radar et présentation responsive.
- `src/scenes/ContactScene.tsx`, `src/components/contact/ContactActions.tsx`, `ContactLinks.tsx` : composition de conclusion, actions email et copie, liens et footer intégré.
- `src/hooks/useCopyEmail.ts` : copie dans le presse-papiers, confirmation après réussite et alternative manuelle.
- `src/config/contact.ts`, `.env.example` : coordonnées publiques centralisées.
- `src/animation/contactTravel.ts`, `contactAnimations.ts`, `src/styles/contact.css` : géométrie mesurée, entrée discrète des actions et responsive.
- `src/components/background/MorphingBackground.tsx`, `backgroundShapes.ts`, `backgroundAnimations.ts`, `src/styles/background.css` : fond SVG unique, silhouettes compatibles, composition relative au viewport, morphing dans la timeline des scènes et thèmes.
- `src/data/projects.ts` : modèle typé et catalogue modifiable, quatre projets principaux, trois secondaires, échange de deux identités.
- `src/hooks/usePreferences.ts` : thèmes, stockage tolérant aux erreurs et prise en compte des changements système de mouvement réduit.
- `src/styles/tokens.css`, `global.css`, `projects.css` : palette et thèmes existants, scènes viewport, galeries et responsive.
- `src/animation/introTimeline.test.ts` : tests du morph, du lien angle/distance, du masque lié à la position, du wink, de la synchronisation, du saut et du mouvement réduit.
- `src/scenes/SceneManager.test.tsx` : intégration React sous StrictMode, instance persistante, thèmes, navigation désactivée et préférence système.
- `public/licenses/bloub-MIT.txt`, `THIRD_PARTY_NOTICES.md` : licence et provenance.
- `index.html`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `package.json` et verrou npm : configuration.

## Chorégraphie

La timeline dure environ 7,3 s : pop organique en nuage, morph réel vers le cercle, roulade vers la gauche, révélation de Bonjour, wink original et pause, roulade vers la droite et arrivée du Hero, puis repos discret.

La rotation pendant chaque roulade est calculée par `distance / rayon`, avec la même courbe temporelle que la translation. Le masque du texte est calculé à chaque image depuis la position horizontale du personnage. GSAP fournit l’horloge au moteur Bloub : aucune boucle rAF concurrente, aucun délai dispersé. Les seules transitions CSS concernent les interactions de l’interface.

Le SVG de Bloub a un calque inférieur à celui du Hero lorsqu’il est derrière le coin supérieur droit du portrait. Le cadre photo est réellement opaque et recouvre le corps : l’occlusion ne repose ni sur un recadrage du SVG ni sur sa disparition. La mascotte n’est jamais démontée pendant les changements de scène. Le repos utilise les micro-mouvements du moteur original, sans rebond répétitif. Le ticker de repos s’arrête en mouvement réduit et ne dessine pas quand l’onglet est masqué. L’introduction existante, y compris le salut multilingue, n’a pas été réécrite ; les sources du moteur Bloub restent inchangées.

Les animations et styles GSAP sont nettoyés avec `gsap.context().revert()`, `timeline.kill()` et retrait du ticker. Un redimensionnement termine proprement le mouvement et recalcule les ancrages. La désactivation des animations donne immédiatement accès à la destination demandée. Une erreur d’initialisation rétablit aussi le contenu. Les scènes inactives et les vues en transition sont `inert`, sans capturer le clavier.

## Navigation et galerie — Sprint 02

Les panneaux occupent `100dvh`, sans longue page verticale. Une timeline de 1,1 s fait monter le Hero et entrer les Projets par le bas, ou effectue l’inverse. La distance séparant les panneaux reste égale à la hauteur du viewport. La barre flotte indépendamment de ces déplacements.

Bloub conserve son SVG, son contrôleur, son moteur et son horloge. Sa trajectoire lit les rectangles du portrait et de l’emplacement Accueil, ainsi que son rayon réel. Il dégage le cadre avant de passer au-dessus des scènes et de la navigation, suit une courbe quadratique et réduit sa taille jusqu’au diamètre du bouton. Le retour suit le chemin inverse ; le calque repasse derrière le portrait à l’approche de l’ancrage. Sur une petite largeur, la sortie choisit le côté libre du portrait et cible l’emplacement réel de la barre en bas. Le SVG ignore les événements du pointeur : le bouton Accueil placé dessous reste accessible et cliquable. Le contrôleur expose seulement une lecture de son temps courant en plus de son API existante.

Une impulsion de molette/trackpad ne peut réclamer qu’un changement, avec seuil cumulé et réarmement après une période de silence. Les gestes tactiles sont reconnus à partir de leur direction et de leur origine ; un geste commencé dans un contenu encore défilable garde le contrôle de ce contenu. Les flèches et Page précédente/suivante fonctionnent aussi hors des contrôles interactifs. Si un panneau déborde, le scroll interne passe en priorité ; le changement de scène intervient à sa limite. Le scroll des archives et des détails ne change jamais de scène. Les animations ont un verrou temporaire, une sortie sur interruption et un garde de libération. Le thème et le mouvement réduit restent accessibles pendant les transitions.

Les quatre cartes principales gardent leurs clés React et leurs nœuds DOM. Dans la version existante au début du Sprint 03, sélectionner une carte ouvre son détail dans `ProjectOverlay`, qui s’étend depuis sa position réelle. Ce fonctionnement est conservé ; l’ancien échange des cartes par FLIP n’est pas réintroduit.

Les deux galeries Projets restent montées et conservent leurs propres `scrollTop`. Le panneau détaillé retient sa carte d’origine et restitue le focus au bouton d’ouverture. Échap ferme le détail. Aller au Hero puis revenir aux Projets conserve la vue consultée. Aucune route ni requête externe n’intervient dans ces changements.

## Parcours — Sprint 03

Le gestionnaire existant positionne les scènes de contenu selon leur index : Hero, Projets, Parcours, Compétences puis Contact. La timeline GSAP conserve une distance d’un viewport entre deux panneaux voisins, y compris après un resize ou une interruption. Entre Projets, Parcours et Compétences, Bloub garde son emplacement Accueil dans la barre et son repos existant. Contact possède un ancrage mesuré distinct, décrit plus bas. Le trajet depuis/vers le portrait reste celui du Sprint 02.

Depuis la galerie principale, le scroll vers le bas rejoint Parcours ; le scroll vers le haut depuis le début de Parcours ramène à la galerie principale. Le défilement interne passe en priorité tant que le contenu n’a pas atteint son bord. La galerie secondaire et le détail superposé restent protégés des changements de scène par scroll. Le retour depuis Parcours réaffiche la sélection principale, tout en conservant ses cartes et son défilement.

`JourneyEntry` sépare les identifiants, titre, catégorie, organisme, dates structurées et libellé de période. Les champs de lieu, description, apprentissages (`highlights`) et lien sont facultatifs ; le panneau ignore les champs absents. Les six entrées sont exclusivement celles fournies : EMLink, SUP2I, e-Com SAS, Orange Digital Center, UpToDate Developers et ULC-ICAM. Le tri utilise `startDate` au format `YYYY-MM` ou `YYYY`, conserve la précision connue et n’utilise jamais les libellés français. Les intervalles peuvent se chevaucher ; ils ne déterminent pas la distance entre les jalons. La catégorie certification existe mais ne possède aucune entrée. Aucun diplôme, certification, résultat ou lien n’est inventé.

La ligne centrale et les jalons ne sont pas des cartes. Les événements alternent à gauche et à droite sur desktop et passent du même côté sur mobile, avec un défilement interne si nécessaire. Une timeline GSAP trace la ligne et fait apparaître les jalons de façon légèrement décalée ; il n’y a pas d’animation perpétuelle. Les catégories disposent aussi de formes distinctes, d’une légende et de libellés dans les détails.

Le fonctionnement Parcours présent au début du Sprint 04 est conservé : panneau permanent, jalon le plus récent sélectionné par défaut, prévisualisation au survol ou au focus, sélection durable au clic. En quittant la timeline, le panneau revient au dernier jalon choisi. La sélection et le défilement sont conservés entre les visites.

Le panneau Parcours est maintenant un panneau éditorial intégré à la scène. Son animation de contenu existante est conservée. Le Sprint 04 ne rétablit pas les anciens panneaux flottants de Parcours.

## Compétences — Sprint 04

La scène occupe un viewport avec un radar à gauche et un panneau permanent à droite. Sur mobile, le panneau se place sous le radar et la scène défile intérieurement. Le panneau de détails garde une hauteur stable sur desktop et dispose de son propre défilement ; les scrollers imbriqués gardent la priorité avant tout changement de scène. Les labels du radar sont de vrais boutons HTML positionnés au-dessus du SVG : ils restent lisibles indépendamment de l’échelle du dessin, ont une cible d’au moins 44 px de hauteur et fournissent une alternative clavier aux points SVG.

`SkillDomain` contient `id`, `name`, `level: 1 | 2 | 3 | 4 | 5`, `description`, `technologies`, `experience?` et `projectIds`. Les cinq domaines sont Frontend, Backend, Data, Architecture logicielle et Outils & DevOps. Les niveaux **4, 3, 2, 3, 3** sont explicitement provisoires (`SKILL_LEVELS_PROVISIONAL`), à valider par le propriétaire. Les listes de technologies et descriptions sont du contenu initial à personnaliser ; aucune année de pratique n’est inventée. Aucun pourcentage de maîtrise n’est affiché. L’échelle Découverte / Initiation / Pratique / Avancé / Expertise est consultable dans un panneau d’information natif accessible au clavier, refermable avec Échap.

La géométrie est une fonction pure : cinq axes espacés de 72°, cinq polygones concentriques et une distance centre-point proportionnelle au niveau sur cinq. Aucun moteur de graphiques n’est ajouté. Une timeline GSAP révèle la grille, déploie le polygone depuis le centre et affiche les points et les labels en environ une seconde. Les animations sont supprimées en mouvement réduit et nettoyées avec les contextes GSAP. Le changement de domaine anime seulement le contenu du panneau avec un petit déplacement et une variation d’opacité ; les animations précédentes sont interrompues proprement.

Frontend est sélectionné par défaut. Le survol d’un label ou d’un point prévisualise un domaine ; quitter le radar restaure la sélection durable. Le clic, le toucher et l’activation d’un bouton au clavier conservent le domaine. Les flèches, Home et End parcourent aussi les labels au clavier. Les aperçus temporaires sont abandonnés lors du départ de la scène, tandis que le domaine sélectionné reste mémorisé.

Les projets associés sont résolus par leur identifiant dans `projectById`, sans copie de leur contenu. Seuls **Forma, Sillage et Fragments** sont initialement reliés à Frontend : leurs métadonnées déclarent React/TypeScript/CSS et les trois sont visiblement marqués comme démonstrations. Ces associations n’affirment ni une réalisation réelle ni l’emploi de toute la liste du domaine. Aucun projet du catalogue ne documente les technologies des quatre autres familles : leurs listes `projectIds` restent vides. Les références absentes sont filtrées ; aucun lien cassé n’est créé.

Un projet associé déclenche la transition vers Projets, puis ouvre le **même `ProjectOverlay` existant** via `ProjectsSceneHandle.openProject`. La galerie d’origine du projet est choisie à partir de `featured`. En fermant une fiche ouverte depuis Compétences, le gestionnaire revient automatiquement à Compétences, avec le domaine sélectionné conservé. Une fiche ouverte normalement depuis la galerie conserve son comportement de fermeture habituel. Le verrou est libéré avant le trajet de retour, y compris si le mouvement a été réduit ou interrompu.

Le scroll depuis la fin de Parcours rejoint Compétences, et le scroll vers le haut depuis le début de Compétences revient à Parcours. Les états et positions de défilement du parcours sont conservés. L’indicateur Compétences est actif et Bloub reste dans son emplacement Accueil. Depuis le Sprint 05, le scroll vers le bas rejoint Contact.

## Contact — Sprint 16

La scène est une conclusion centrée : « Me contacter. », sous-titre, repère de la mascotte persistante, bouton email, copie de l’adresse et liens GitHub / LinkedIn. Le marqueur, la signature supérieure et le footer commun sont conservés. Le formulaire, la lettre, la bulle, le transport HTTP et les réactions d’envoi ont été supprimés après vérification de leurs usages.

`ContactActions.tsx` utilise l’adresse publique déjà configurée dans `src/config/contact.ts`, également utilisée par `contactMailto`. Le bouton « M’écrire un email » ouvre la messagerie ; il n’effectue aucun envoi automatique et ne prétend jamais qu’un message est reçu. Les coordonnées restent modifiables via les variables publiques de `.env.example`. Aucun backend, secret ou fournisseur d’email n’est nécessaire.

`useCopyEmail.ts` appelle l’API Clipboard et confirme « Adresse copiée » uniquement après résolution positive. Les doubles demandes simultanées sont empêchées. Une absence d’API ou une erreur affiche l’adresse sélectionnable et une instruction de copie manuelle ; aucune réussite n’est simulée. Le retour est accessible par une région de statut. La sélection manuelle ne prend pas le focus dans une scène inactive et les réponses asynchrones sont ignorées après démontage.

Bloub reste l’unique SVG du gestionnaire de scènes. Son repère central est mesuré par le contrôleur de transition existant ; les trajets depuis la barre, leurs inverses et les accès directs sont conservés. Un ResizeObserver recalcule seulement son ancrage lorsque le contenu se redimensionne, notamment lors d’une erreur de copie. L’animation d’entrée n’anime que le texte et les actions, pas le personnage. Le nettoyage GSAP et la préférence de mouvement réduit sont conservés.

La scène réutilise les trois lignes du cadre global : en-tête, contenu central et footer. Les règles locales utilisent `clamp()` et la hauteur du viewport pour les espacements et la taille de Bloub. Les faibles hauteurs réduisent d’abord ces espaces ; aucun `transform: scale()` n’est appliqué à la scène. Le défilement central natif reste possible si nécessaire, surtout sur mobile et pour la copie manuelle. Aucun nouveau gestionnaire de scroll n’est ajouté. Le footer et la navigation restent hors de cette zone.

Vérifications : TypeScript, lint et build réussis ; 25 tests ciblés Contact / configuration / trajets de Bloub réussis. La suite complète contient 199 tests réussis et neuf échecs déjà constatés avant ce sprint, sur les contenus/galeries de projets et la navigation radar/parcours. Les tests associés au formulaire et au service supprimés ont été remplacés par ceux des nouvelles actions.

La vérification visuelle de 1920 × 1080, 1366 × 768, 1280 × 720, 390 × 844 et 375 × 667 n’a pas pu être exécutée : l’hôte navigateur et le contrôle natif sont indisponibles. Les tests DOM ne prouvent pas l’absence de débordement CSS dans ces formats. Aucun email n’a été envoyé et aucun presse-papiers réel n’a été modifié pendant les tests : l’API est simulée dans les fixtures.

## Fond contextuel — Sprint 06

Une seule instance de `MorphingBackground` reste montée dans le gestionnaire de scènes, y compris pendant la relecture de l’introduction, les changements de thème et l’ouverture des projets. La couleur de base reste celle des tokens existants. Les grandes formes débordent volontairement aux coins supérieur droit et inférieur gauche ; un dégradé radial fournit un halo diffus sans filtre de flou. La composition contient un seul contour source et deux références SVG `use`, plutôt que deux moteurs ou des fonds par scène.

`sceneBackgrounds` centralise les destinations : Introduction/Hero → cercle, Projets → squircle, Parcours → triangle arrondi, Compétences → hexagone, Contact → forme organique à lobes. Ce système ne dépend pas du composant ou du moteur de Bloub. Le contenu des scènes et les animations contextuelles de la mascotte présentes avant ce sprint sont conservés.

Les silhouettes sont échantillonnées sur les mêmes **48 rayons**, dans le même sens et avec les mêmes repères angulaires. Chaque point est interpolé entre le contour courant et celui de destination. Des tangentes Catmull–Rom produisent un chemin SVG fermé de 48 segments cubiques continus ; un léger lissage des rayons adoucit les coins des polygones. C’est le `d` du même chemin qui évolue, sans fondu entre silhouettes ni plugin de morphing supplémentaire.

`createBackgroundController.appendTo` ajoute son tween à la timeline verticale existante : départ à **10 %**, fin à **85 %** des 1,1 seconde de transition. Les déplacements des scènes et de Bloub conservent leur horloge et leur timing. Une navigation directe interpole immédiatement vers la géométrie demandée, sans parcourir les autres formes. La finalisation, l’interruption, le redimensionnement ou le passage en mouvement réduit appliquent la destination active et annulent les écritures obsolètes. La relecture de l’introduction utilise son horloge existante pour revenir au cercle ; passer l’introduction fixe directement cette géométrie.

Le fond n’a aucun ticker et reste statique entre les navigations. `ResizeObserver`, avec un listener `resize` de secours, mesure le viewport SVG et recalcule sa composition. Le `viewBox` suit ces dimensions réelles, ce qui préserve les proportions des formes en portrait comme en paysage. Sur mobile, les formes et le halo sont réduits et les contours secondaires atténués. Les thèmes partagent le même moteur et adaptent seulement leurs opacités et couleurs avec les variables CSS.

Le fond est décoratif (`aria-hidden`, `focusable="false"`, `pointer-events: none`) et placé au niveau zéro. Les surfaces générales des scènes et des vues de galerie deviennent transparentes ; les cartes, le portrait, les panneaux, le formulaire et les overlays conservent leur fond opaque et leurs couches existantes. Aucun nouveau filtre coûteux ni animation perpétuelle n’est ajouté. Les listeners, observers et tweens sont nettoyés au démontage.

Vérifications du Sprint 06 : **TypeScript, lint, build et 175 tests réussis**, contre 166 tests de référence avant modification. La page et les bundles de production locaux répondent HTTP 200. Les neuf nouveaux tests couvrent les géométries, les contours intermédiaires, les navigations directes et inverses, l’horloge commune, les interruptions, le mouvement réduit, la composition mobile, le nettoyage, la persistance dans StrictMode, les thèmes, les overlays et la relecture de l’introduction. La validation visuelle réelle reste à effectuer : l’hôte navigateur et le contrôle natif sont indisponibles dans cet environnement. Les tests DOM et géométriques ne mesurent pas le contraste perçu ou le ressenti de la chorégraphie sur appareil physique.

## Remplacer les démonstrations

Tous les exemples actuels sont fictifs : **Forma, Sillage, Monochrome, Tempo** dans la sélection et **Fragments, Clair, Focus** dans la galerie secondaire. Leur contenu, leurs technologies et leurs fonctionnalités illustrent la mise en page ; ils ne décrivent pas des réalisations personnelles vérifiées.

Modifier `src/data/projects.ts` : garder des identifiants stables, exactement quatre entrées `featured: true`, renseigner les vrais textes et technologies, ajouter `thumbnail` / `cover` pour les images et seulement des liens HTTPS réellement disponibles dans `links`. Passer `demo` à `false` uniquement pour un projet réel. Les aperçus CSS/SVG locaux sont explicitement conceptuels et servent de fallback si aucune image n’est renseignée. Aucun lien fictif n’est généré.

## Périmètre et limites

Introduction, Hero, Projets, Parcours, Compétences et Contact sont disponibles. La photo existante du propriétaire est conservée. Les projets restent des démonstrations clairement identifiées et les niveaux des compétences restent provisoires. Contact utilise directement la messagerie du visiteur et la copie de l’adresse, sans formulaire ni backend.

L’introduction se joue au chargement et peut être rejouée avec le premier indicateur. Une préférence système de mouvement réduit ouvre directement le Hero. Le bouton de mouvement permet de modifier cette préférence pour ce site.

La validation visuelle dans un navigateur reste à réaliser : l’hôte navigateur et le contrôle natif étaient indisponibles dans l’environnement de réalisation. Les tests de DOM ne vérifient pas le rendu CSS réel, les points de rupture ni le ressenti de la chorégraphie sur un appareil physique.

Vérifications finales du Sprint 05 : **TypeScript, lint, build et 166 tests réussis** (les 144 tests de référence passaient avant modification). La page de production locale et ses bundles JavaScript/CSS répondent HTTP 200. Les nouveaux tests couvrent la configuration publique, la validation, les réponses serveur strictes, l’indisponibilité du transport, les erreurs, le timeout, l’annulation, les doubles soumissions, la conservation du brouillon, le focus, la confirmation et la rédaction d’un nouveau message. Ils couvrent aussi les ancrages mesurés, les trajets Contact ↔ barre et Contact ↔ Hero, les destinations directes, les interruptions et le mouvement réduit. Les tests précédents des scènes et overlays continuent de passer. Aucune dépendance n’a été ajoutée ; les fichiers du moteur Bloub sont identiques à ceux de la référence originale. Les alertes des outils de développement relevées aux sprints précédents n’ont pas été réauditées ici.

La publication privée via Sites a été préparée mais l’export des sources a été rejeté par le contrôle automatique d’autorisation. Aucun code du portfolio n’a été envoyé au dépôt Sites et aucune version n’a été déployée. Le projet reste intégralement utilisable en local ; `.openai/hosting.json` conserve seulement l’identifiant du site privé créé, sans identifiant secret.
