# Galerie immersive — Sprint 13

## Activer une galerie

Le type existant `ProjectMedia` et le champ facultatif `gallery` sont réutilisés sans modification du modèle. Placer de véritables captures dans `src/assets/projects/`, les importer depuis le fichier du projet, puis les référencer dans `gallery` avec un `src`, un `alt` décrivant réellement l’image et, si utile, une `caption`.

Aucune capture de projet n’est actuellement présente dans les assets locaux. Aucun contenu de projet ni média fictif n’a été ajouté : les fiches actuelles gardent leur hero éditorial jusqu’à ce qu’un tableau `gallery` non vide soit renseigné. Les références vides et les doublons de sources sont ignorés.

`cover`, `thumbnail`, `captures` et `architectureDiagram` conservent leur rendu existant. Le tableau `gallery` est désormais présenté dans le hero au lieu d’être répété dans la section finale des médias.

## Composants et animations

`ProjectHeroGallery.tsx` reçoit le titre, la signature, les médias et la préférence de mouvement transmise par l’overlay. Sans média, il restitue les éléments éditoriaux d’origine sans wrapper, bouton ou hauteur réservée.

Avec des médias, la première image devient un fond discret dans le même hero. Le bouton à droite ouvre ou ferme la galerie. GSAP anime la hauteur de cette seule zone, la translation et l’échelle du bloc titre/signature, l’opacité du voile et les commandes. La hauteur dépend du texte et du conteneur interne de l’overlay. Un ResizeObserver recalcule les dimensions après un changement de taille, sans relancer l’animation à chaque frame. Le titre est isolé des transitions d’images.

Les images gardent leurs proportions avec `object-fit: contain`. Les changements utilisent un fondu court ; les images ne sont montées qu’à leur première consultation. Les flèches cyclent dans les deux sens et disparaissent si une seule image existe. Les touches gauche/droite fonctionnent depuis les commandes du hero ; les touches de défilement normal et Échap continuent vers leur comportement existant. Les commandes masquées sont désactivées, avec restitution du focus au bouton de galerie si nécessaire.

Les timelines précédentes sont tuées avant une nouvelle transition, en conservant la position courante. Elles sont également nettoyées au démontage. Avec les animations réduites, les états sont appliqués directement. Le fonctionnement GSAP de l’overlay principal n’est pas modifié ; il transmet seulement sa préférence `reduced` à `ProjectDetail`.

## Fermeture pendant la lecture

`useGalleryScrollIntent.ts` observe exclusivement le conteneur `.overlay-scroll` déjà existant. Les listeners sont passifs : aucun `preventDefault`, aucun scroll de fenêtre et aucune simulation de défilement ne sont utilisés.

- Molette/trackpad : fermeture après une intention descendante cumulée de 32 pixels dans une impulsion rapprochée. Les gestes horizontaux, ascendants et les zooms sont ignorés.
- Tactile : un déplacement vertical ascendant du doigt d’au moins 32 pixels ferme la galerie. Les gestes horizontaux ne changent pas l’image.
- Défilement réel du conteneur, notamment au clavier : une progression descendante de 24 pixels ferme la galerie ; les petites variations ne suffisent pas.

Les listeners disparaissent quand la galerie se ferme ou quand la fiche est démontée. Le scroll natif poursuit la lecture pendant la réduction du hero. L’ancrage automatique du navigateur est désactivé uniquement dans un overlay contenant cette galerie afin de limiter les compensations pendant sa variation de hauteur.

## États et limites

Une image en échec affiche un message explicite ; les autres images et la fermeture restent disponibles. Les textes alternatifs fournis sont conservés. La composition utilise le fond Ink, le texte Paper et l’accent Signal dans le hero photographique pour garder le contraste dans les deux thèmes ; les métadonnées et le reste de la fiche conservent leur thème habituel.

Les tests utilisent des références d’images synthétiques uniquement comme fixtures, sans ajouter de fausses captures au site. Ils vérifient les états, le cycle des images, le clavier, les intentions de scroll, les gestes tactiles, les échecs de chargement, les interruptions et Échap pendant l’animation. Une ancienne attente du test de progression de ProjectHub a été isolée du contenu enrichi du projet en vidant explicitement les réalisations de la fixture, sans changer les données réelles.

La validation visuelle sur desktop, tablette, mobile et petite hauteur reste à faire : l’hôte navigateur et le contrôle natif sont indisponibles dans cet environnement. Les tests DOM ne valident ni le rendu des images réelles ni le ressenti du scroll natif sur appareil physique.

Contrôles exécutés : TypeScript, lint et build réussis ; **200 tests passent**. Les 12 fichiers du catalogue, modèle et réexports compris, conservent leurs empreintes d’origine. Dans `ProjectOverlay`, la seule modification est la transmission de la propriété `reduced` au composant de détail.
