# Fiches de projets — Sprint 09

Le rendu éditorial se trouve dans `src/components/projects/ProjectDetail.tsx`, avec des styles limités à `.project-study` dans `src/styles/projects.css`. Les cartes des galeries et les autres scènes ne sont pas modifiées.

## Composition

- Introduction typographique : titre, signature, résumé, catégorie, statut, équipe, rôle et liens publics. La présentation existante conserve ses paragraphes.
- Problème et solution en deux colonnes, sans cartes de fond.
- Réalisations sous forme de grille numérotée.
- Architecture pleine largeur et liste unique des technologies.
- Contribution personnelle en composition asymétrique avec un filet menthe.
- Défis numérotés, avec prise en charge d’un seul élément ou d’un nombre impair.
- État actuel et prochaines étapes dans deux blocs clairement distincts.
- Médias uniquement lorsqu’ils sont fournis.

Toutes les sections sont conditionnelles, y compris les contenus blancs ou listes vides. Une fiche partielle n’affiche aucune rubrique de remplissage. Les paragraphes de Noven et les réserves sur son avancement sont conservés intégralement ; son fichier n’a pas été modifié. Le nombre de sections n’impose aucune information supplémentaire aux autres projets.

## Médias facultatifs

`ProjectMedia` contient `src`, `alt` et `caption?`. Deux nouveaux champs facultatifs utilisent ce modèle :

- `architectureDiagram?: ProjectMedia` : affiche un schéma fourni dans la section architecture.
- `gallery?: ProjectMedia[]` : depuis le Sprint 13, médias avec texte alternatif et légende dans le hero interactif ; voir [project-hero-gallery.md](project-hero-gallery.md).

`cover`, `thumbnail` et `captures` restent compatibles. Les références identiques sont dédupliquées, y compris entre le schéma et la galerie. Les images gardent leurs proportions et ne sont pas recadrées. Aucun média ni schéma n’a été ajouté au catalogue. Noven n’affiche donc ni couverture géante ni faux aperçu.

Le rendu des anciennes `captures` est maintenant centralisé dans `ProjectDetail` ; son ancien bloc a été retiré du JSX de `ProjectOverlay`. Les fonctions et paramètres GSAP, dimensions de l’overlay, backdrop, fermeture, focus et listeners restent inchangés.

## Responsive et vérification

Les grilles passent sur une colonne à 900 px de viewport ; la typographie et les espacements s’adaptent aux petits formats. Les colonnes utilisent `minmax(0, 1fr)`, les technologies reviennent à la ligne et les mots longs peuvent être coupés. Les nouveaux styles utilisent uniquement les tokens existants et fonctionnent avec le même moteur dans les deux thèmes.

Des tests couvrent les dix projets, les contenus optionnels, la conservation des textes, la séparation entre livré et prévu, les médias, la liste unique des technologies et les liens publics. Les tests de l’overlay contrôlent les timelines d’ouverture et de fermeture, le focus, Tab / Maj+Tab, Échap, le backdrop et le mouvement réduit.

Vérifications effectuées : `npm run typecheck`, `npm run lint`, `npm test` (**188 tests**, contre 179 avant modification) et `npm run build` réussis. L’index et ses bundles de production répondent HTTP 200 en local. Les empreintes SHA-256 de `noven.ts`, `ProjectCard.tsx` et `ProjectVisual.tsx` sont identiques avant et après cette refonte.

La vérification visuelle des formats desktop large, 1366 × 768, tablette, 390 × 844 et 320 px reste à effectuer : l’hôte navigateur et le contrôle natif sont indisponibles dans l’environnement de réalisation. Les tests DOM ne prouvent pas le rendu CSS réel ni le confort de lecture sur ces appareils.
