## Parties D et E : formulaire CRUD, validation, qualité et livraison

*Réalisées par Mouhamed Dabo, branche `feature/formulaire-crud`.*

### Fonctionnalités (partie D)

- **Ajout** : formulaire `/guides/nouveau` avec les 8 champs du modèle `GuideTouristique` (prénom, nom, spécialité, région, téléphone, e-mail, note, disponibilité). L'identifiant est attribué par le service, jamais saisi.
- **Champs obligatoires** : tous sauf la case « disponible » (cochée par défaut). Les champs obligatoires sont marqués d'un `*`.
- **Validation** (affichée sous chaque champ, après avoir quitté le champ ou au clic sur « Enregistrer ») :
  - prénom et nom : 2 caractères minimum, espaces seuls refusés ;
  - spécialité : 3 caractères minimum ;
  - e-mail : forme `nom@domaine.ext`, et **unique** (un autre guide ne peut pas avoir le même) ;
  - téléphone sénégalais : 9 chiffres commençant par 70, 75, 76, 77, 78 ou 33, indicatif `+221` ou `00221` facultatif, espaces tolérés ;
  - région : choisie dans la liste des 14 régions du Sénégal ;
  - note : nombre de 0 à 5.
- **Modification** : bouton « Modifier » sur chaque carte → `/guides/:id/modifier`, formulaire pré-rempli. Un identifiant inconnu affiche un message « Guide introuvable ».
- **Suppression** : bouton « Supprimer » → boîte de **confirmation** (« Cette action est irréversible ») avec Annuler / Supprimer.
- **Messages** : un message de succès ou d'erreur s'affiche en haut de page (ajout, modification, suppression, formulaire invalide, enregistrement impossible). Il disparaît seul après 6 secondes ou avec le bouton ×.

### Qualité, ergonomie et livraison (partie E)

| Point du sujet | Réalisation |
|---|---|
| Service injectable centralisé | `GuideService` : seul endroit qui lit et modifie les données (`getGuides`, `getGuideById`, `addGuide`, `updateGuide`, `deleteGuide`, `prochainId`, `emailExiste`) |
| Responsive | grille du formulaire en 2 colonnes puis 1 colonne sous 640 px ; boutons pleine largeur sur téléphone ; testé à 380 px de large (pas de défilement horizontal) |
| Clavier et labels | chaque champ a un `<label for>` ; ordre de tabulation logique ; focus visible (contour jaune) ; lien d'évitement « Aller au contenu » ; en cas d'erreur, le curseur se place sur le premier champ invalide |
| Lecteurs d'écran | `aria-invalid`, `aria-describedby` (message d'erreur ou aide), `aria-required`, zone `aria-live` pour les messages, boutons « Modifier la fiche de … » avec un libellé explicite, `lang="fr"` |
| Pas de couleur seule | un champ en erreur a une bordure rouge **et** un message avec le symbole ⚠ |
| État vide | liste vide : message + bouton « Ajouter un guide » |
| Confirmation avant suppression | `<dialog>` natif (focus piégé dans la boîte, fermeture avec Échap) |
| Données de démonstration | 6 guides **fictifs** (adresses `@example.com`, numéros inventés) dans 6 régions différentes |
| Tests | `ng test` : 28 tests (service, formulaire, liste, application) |

### Fichiers

| Fichier | Rôle |
|---|---|
| `src/app/services/guide.ts` | Service : données dans un `signal`, ajout, modification, suppression, calcul de l'id |
| `src/app/services/notification.ts` | Service des messages de succès et d'erreur |
| `src/app/components/guide-form/` | Formulaire d'ajout et de modification, validateurs, messages d'erreur |
| `src/app/components/notification/` | Affichage des messages |
| `src/app/components/not-found/` | Page 404 |
| `src/app/components/guide-list/` | Ajout des boutons Modifier / Supprimer et de la boîte de confirmation |
| `src/app/models/regions.ts` | Liste des 14 régions du Sénégal |
| `src/app/app.routes.ts`, `app.html`, `app.ts`, `app.css` | Routage, en-tête, navigation, pied de page |
| `src/styles.css` | Couleurs et boutons communs |

### Choix techniques

- **`signal` dans le service** : `guides` est un `signal`. Comme la liste lit `getGuides()` dans un `computed`, elle se met à jour toute seule après un ajout, une modification ou une suppression. Chaque écriture crée une **nouvelle liste** (`update`) au lieu de modifier l'ancienne (`push`).
- **Prochain identifiant** : `Math.max(0, ...ids) + 1`. Il part du plus grand id (pas du nombre de guides) : avec les ids 1, 2, 4, 5 le suivant est 6 ; avec une liste vide, 1.
- **Formulaire réactif** (`ReactiveFormsModule`) : les règles de validation sont dans le code TypeScript, donc testables sans afficher la page.
- **`novalidate`** sur le formulaire : les messages sont les nôtres (en français, précis), pas les bulles du navigateur.
- **Routes** : `/guides` (liste), `/guides/nouveau`, `/guides/:id/modifier`, `**` (page introuvable).

### Limites de la solution

1. **Aucune persistance** : les données vivent dans la mémoire du navigateur. Un rechargement de la page remet les 6 guides de démonstration et efface les ajouts, modifications et suppressions.
2. **Validation côté client uniquement** : un utilisateur peut la contourner (outils du navigateur, requête directe). Le contrôle d'unicité de l'e-mail n'est pas fiable non plus : deux agents sur deux ordinateurs ne partagent pas la même liste.
3. **Pas d'authentification ni de droits** : n'importe quel visiteur peut ajouter, modifier ou supprimer une fiche.
4. **Suppression définitive** : pas d'annulation après confirmation (pas de corbeille).
5. **Identifiants générés côté client** : en situation réelle, deux agents pourraient obtenir le même id.

### Évolution possible vers une API REST

Le composant ne parle qu'au service : seul `GuideService` change. Le tableau en mémoire est remplacé par `HttpClient` (déclaré avec `provideHttpClient()` dans `app.config.ts`) :

| Méthode du service | Appel HTTP |
|---|---|
| `getGuides()` | `GET /api/guides` |
| `getGuideById(id)` | `GET /api/guides/:id` |
| `addGuide(donnees)` | `POST /api/guides` (le serveur renvoie le guide avec son `id`) |
| `updateGuide(guide)` | `PUT /api/guides/:id` |
| `deleteGuide(id)` | `DELETE /api/guides/:id` |

```ts
private readonly http = inject(HttpClient);

lister(): Observable<GuideTouristique[]> {
  return this.http.get<GuideTouristique[]>('/api/guides');
}
```

Changements associés :

- les méthodes renvoient des `Observable` : le formulaire attend la réponse avant de naviguer et de dire « Guide ajouté » ;
- **indicateur de chargement** pendant les appels, **message d'erreur** si le réseau ou le serveur échoue (le champ `notification.erreur(...)` existe déjà) ;
- le serveur **revalide** toutes les données (e-mail, téléphone, longueurs), contrôle l'unicité de l'e-mail (réponse `409 Conflict` affichée sous le champ) et gère l'authentification ;
- aucun mot de passe ni clé privée dans le code Angular.
