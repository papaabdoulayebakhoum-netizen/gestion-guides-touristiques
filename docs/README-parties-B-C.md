## Parties B et C : répertoire, recherche et filtres

*Réalisées par Abdoulaye Dramé, branche `feature/recherche-filtres`.*

### Fonctionnalités

- **Affichage en cartes** : chaque guide est présenté dans une carte lisible (nom, prénom, région, spécialité, téléphone, e-mail, note).
- **Recherche multicritère** : un champ unique cherche dans le nom, le prénom et la spécialité.
  - Insensible aux majuscules et aux accents (`eco` trouve « Écotourisme »).
  - Accepte plusieurs mots : `abdoulaye patrimoine` ne garde que les guides contenant les deux mots.
- **Filtres** :
  - par **région** (la liste des régions est déduite des données, triée, sans doublon) ;
  - par **statut** (Disponible / Indisponible).
  - La recherche et les deux filtres se **combinent**.
- **Présentation** :
  - la note est formatée par le pipe `noteFormat` (ex. `4,8 / 5`, ou « Non noté » si elle est absente) ;
  - le statut est affiché par un **badge** (texte + couleur, pour ne pas dépendre de la couleur seule).
- **États vides** :
  - aucun guide enregistré → message invitant à en ajouter un ;
  - aucun résultat pour la recherche → message explicite et bouton **Réinitialiser**.
- **Accessibilité et responsive** :
  - chaque champ a un `<label>` associé ;
  - le nombre de résultats est annoncé aux lecteurs d'écran (`aria-live`) ;
  - le focus clavier est visible ;
  - la grille s'adapte du bureau au téléphone.

### Fichiers

| Fichier | Rôle |
|---|---|
| `src/app/components/guide-list/guide-list.ts` | Logique : signaux de recherche et de filtres, liste filtrée calculée |
| `src/app/components/guide-list/guide-list.html` | Formulaire de recherche, filtres, cartes, états vides |
| `src/app/components/guide-list/guide-list.css` | Styles, badges, responsive |
| `src/app/pipes/note-format-pipe.ts` | Pipe de formatage de la note |

### Choix techniques

- **Signals et `computed`** : chaque critère est un `signal` ; la liste affichée (`guidesFiltres`) est un `computed`, recalculé uniquement quand un critère ou les données changent.
- **Données centralisées** : le composant ne stocke aucune donnée, il lit le service `GuideService` (séparation des responsabilités).
- **Nouvelle syntaxe de contrôle** : `@if`, `@for` avec `track`, sans `*ngIf` ni `*ngFor`.
- **`ChangeDetectionStrategy.OnPush`** : le composant ne se met à jour que lorsque ses signaux changent.

### Limites de la solution

1. **Données en mémoire** : les guides sont perdus au rechargement de la page, rien n'est enregistré durablement.
2. **Recherche et filtres côté client** : tous les guides sont chargés dans le navigateur. Cela convient pour quelques dizaines de fiches, mais pas pour des milliers.
3. **Pas de pagination ni de tri** : tous les résultats s'affichent d'un coup, dans l'ordre des données.
4. **Statut limité à deux valeurs** : le modèle ne contient que `disponible` (oui/non), sans état intermédiaire (ex. « Occupé »).
5. **Filtres non mémorisés** : ils sont perdus quand on change de page ou qu'on recharge.

### Évolution possible vers une API REST

Remplacer le tableau du service par des appels `HttpClient` :

- `GET /api/guides` pour charger la liste ;
- `GET /api/guides?q=diop&region=Dakar&disponible=true` pour **déléguer la recherche et les filtres au serveur**, avec pagination (`page`, `taille`) ;
- ajouter un indicateur de chargement et un message en cas d'erreur réseau ;
- conserver les critères dans l'URL (query params) pour partager ou retrouver une recherche.

La validation et les autorisations devront aussi être appliquées côté serveur : le filtrage côté client ne protège rien.
