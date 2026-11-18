# Bloub

Source : https://github.com/jeremy-prt/bloub

Auteur : Jérémy Perret. Licence MIT, copie dans `public/licenses/bloub-MIT.txt`.

Version étudiée et copiée : `b4bb3c1b5f93c7b87a2e8d620f667c4093d97749`.

`src/mascot/vendor/` conserve sans modification le moteur TypeScript et ses six fichiers de tests : engine, shape, profiles, skins, expressions, face, eyefit, math, states, decor, cycles et repere.

Réutilisation effective : profils radiaux à 64 échantillons, formes `nuage` et `cercle`, interpolation `BotEngine.setShape`, génération des paths SVG du corps et des yeux, correction de position des yeux, état `wink`, état `idle`, clignements et mouvements subtils du regard. Les autres états restent disponibles dans les sources du moteur mais ne sont pas exposés dans cette interface.

Le rendu SVG de `BloubBot.vue` a été adapté en React : les yeux restent des trous dans un masque SVG, avec un fond opaque sous le corps. Le viewBox est resserré autour du corps pour les trois états utilisés. Les couleurs visibles viennent exclusivement des tokens du portfolio. Aucun runtime Vue, interface d’édition, exporteur, asset de démonstration ou système de navigation du dépôt original n’est embarqué.

Le dépôt original précise qu’il reproduit un avatar de x.ai, sans affiliation. La licence MIT couvre le code du dépôt et non le design qu’il imite.
