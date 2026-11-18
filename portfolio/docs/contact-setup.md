# Activer l’envoi de messages

## État actuel

Le portfolio est une application Vite statique. Le projet ne contient ni backend, ni fonction serverless d’envoi, ni compte de fournisseur d’email. La configuration d’hébergement existante publie seulement `dist/` : elle ne traite pas les requêtes POST.

L’interface Contact et sa validation sont disponibles. L’envoi direct est désactivé tant que `VITE_CONTACT_ENDPOINT` est vide. Le lien email ouvre la messagerie du visiteur vers **tfmukendi@gmail.com** ; il ne constitue pas une confirmation d’envoi et ne déclenche aucune animation de succès.

Les coordonnées publiques fournies par le propriétaire sont centralisées dans `src/config/contact.ts`. GitHub, LinkedIn et email sont affichés dans Contact. X, Instagram et Facebook sont également utilisés dans le portrait. Aucune adresse, URL ou expérience supplémentaire n’est inventée.

## Configuration publique

Copier `.env.example` vers `.env.local` si des valeurs doivent être remplacées. Le fichier local est ignoré ; l’exemple est versionnable. Une valeur publique vide masque le lien concerné.

```dotenv
VITE_CONTACT_EMAIL=tfmukendi@gmail.com
VITE_CONTACT_GITHUB=https://github.com/Tranck04
VITE_CONTACT_LINKEDIN=https://www.linkedin.com/in/tracy-franck-mukendi-8bb90242a
VITE_CONTACT_ENDPOINT=
```

Les variables `VITE_` sont incorporées au JavaScript public lors du build. **Ne jamais y placer une clé privée, un mot de passe SMTP ou un token de fournisseur.** Le destinataire serveur et les identifiants du fournisseur se configurent exclusivement dans l’environnement du backend.

L’endpoint peut être un chemin de même origine, par exemple `/api/contact` si l’hébergement le dessert réellement, ou une URL HTTPS complète contrôlée par le propriétaire. L’exemple n’est pas une route déjà implémentée. Les URLs HTTP, les URLs contenant des identifiants et les chemins commençant par `//` sont refusés.

Après modification de l’environnement, redémarrer Vite en développement ou reconstruire le site en production.

## Contrat du serveur à fournir

`createContactSubmitter` dans `src/services/contactService.ts` envoie une requête POST avec `Content-Type: application/json` et `Accept: application/json`. Les cookies ne sont pas envoyés et les redirections sont refusées.

```json
{
  "name": "Nom du visiteur",
  "email": "visiteur@example.com",
  "message": "Son message",
  "website": ""
}
```

Les trois premiers champs sont obligatoires et leurs espaces périphériques sont supprimés. `website` est un honeypot qui doit rester vide.

Le serveur doit :

1. Valider de nouveau les types, les champs obligatoires, l’email et les limites : nom 100 caractères, email 254, message 5 000. Limiter également la taille du corps HTTP.
2. Refuser le honeypot rempli ; ne jamais transformer ce refus en faux succès.
3. Appliquer une limitation de débit avec réponse HTTP 429 en cas d’excès et une politique d’origine/CORS adaptée au domaine réel du portfolio.
4. Utiliser un fournisseur d’email ou une file de livraison configurée avec des secrets uniquement côté serveur. Garder le destinataire et l’expéditeur vérifié côté serveur ; utiliser l’adresse du visiteur comme adresse de réponse après validation.
5. Attendre un véritable accusé d’acceptation du fournisseur ou de la file avant de répondre avec succès. Éviter les journaux contenant les noms, adresses ou messages des visiteurs.

Réponse de succès attendue : un statut HTTP 2xx **et** le JSON exact suivant (des champs supplémentaires sont tolérés).

```json
{ "success": true }
```

Répondre avec un statut HTTP d’erreur pour une validation refusée, un débit dépassé ou une panne du fournisseur. Le frontend n’affiche pas aveuglément un message d’erreur arbitraire provenant du serveur. Une réponse vide, HTML, un simple HTTP 200, `success: false` ou la chaîne `"true"` ne sont pas interprétés comme un succès.

Le client annule une requête après 15 secondes et conserve le brouillon. Un timeout ne prouve pas que le serveur n’a rien reçu : le message indique que l’envoi n’a pas pu être confirmé. Pour limiter les doublons après un timeout ambigu, le futur serveur peut aussi prendre en charge une clé d’idempotence ; aucun mécanisme serveur de ce type n’est livré ici.

## Mise en service

1. Créer ou connecter un backend/serverless sur l’infrastructure choisie et implémenter le contrat ci-dessus. Un hébergement statique seul ne suffit pas.
2. Renseigner ses secrets, son destinataire, son expéditeur et ses règles antispam dans son environnement serveur.
3. Tester ce service indépendamment, notamment refus de validation, honeypot, limitation de débit et panne du fournisseur.
4. Renseigner son URL dans `VITE_CONTACT_ENDPOINT`, puis exécuter `npm run typecheck`, `npm run lint`, `npm test` et `npm run build`.
5. Vérifier avec une boîte de test contrôlée qu’un message est réellement pris en charge, qu’un refus conserve le texte et que le succès est annoncé au clavier et au lecteur d’écran.

Aucun fournisseur n’est installé ou déployé par ce sprint. Les tests automatisés simulent le transport pour vérifier les états ; ils n’envoient pas d’email réel.

## Comportement après réception confirmée

Une réponse positive réelle remplace les champs par une confirmation accessible, anime sobrement la lettre et déclenche le `wink` original de Bloub si Contact est encore actif. La bulle devient « À bientôt. ». Si l’utilisateur consulte une autre scène, son personnage ne réagit pas ailleurs ; la confirmation est conservée pour son retour. Le bouton « Écrire un nouveau message » réinitialise explicitement les champs et remet le focus sur le nom.

Les erreurs conservent les champs et permettent une nouvelle tentative. Les données saisies restent uniquement dans l’état React pendant la session de page ; elles ne sont pas enregistrées dans le stockage local. Un rechargement perd le brouillon. La requête est annulée au démontage du composant. Les mouvements réduits suppriment la chorégraphie sans supprimer les états ni les actions.
