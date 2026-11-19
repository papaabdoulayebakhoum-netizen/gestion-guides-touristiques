import { Injectable, signal } from '@angular/core';
import { GuideTouristique } from '../models/guide-touristique.model';

/** Données d'un guide avant l'attribution de son identifiant. */
export type NouveauGuide = Omit<GuideTouristique, 'id'>;

/**
 * Jeu de données de démonstration : toutes les personnes, adresses et numéros
 * sont FICTIFS (adresses en example.com, numéros inventés).
 */
const DONNEES_DEMO: GuideTouristique[] = [
  {
    id: 1,
    prenom: 'Aminata',
    nom: 'Diop',
    specialite: 'Patrimoine historique et île de Gorée',
    region: 'Dakar',
    telephone: '+221 77 000 00 01',
    email: 'aminata.diop@example.com',
    note: 4.8,
    disponible: true,
  },
  {
    id: 2,
    prenom: 'Mamadou',
    nom: 'Sagna',
    specialite: 'Mangroves et écotourisme',
    region: 'Ziguinchor',
    telephone: '+221 78 000 00 02',
    email: 'mamadou.sagna@example.com',
    note: 4.7,
    disponible: true,
  },
  {
    id: 3,
    prenom: 'Fatou',
    nom: 'Sarr',
    specialite: 'Salines et traditions du Sine-Saloum',
    region: 'Fatick',
    telephone: '+221 76 000 00 03',
    email: 'fatou.sarr@example.com',
    note: 4.9,
    disponible: false,
  },
  {
    id: 4,
    prenom: 'Cheikh',
    nom: 'Fall',
    specialite: 'Histoire et patrimoine de Saint-Louis',
    region: 'Saint-Louis',
    telephone: '+221 77 000 00 04',
    email: 'cheikh.fall@example.com',
    note: 4.6,
    disponible: true,
  },
  {
    id: 5,
    prenom: 'Awa',
    nom: 'Ndiaye',
    specialite: 'Tourisme balnéaire et plages de la Petite-Côte',
    region: 'Thiès',
    telephone: '+221 70 000 00 05',
    email: 'awa.ndiaye@example.com',
    note: 4.3,
    disponible: false,
  },
  {
    id: 6,
    prenom: 'Ibrahima',
    nom: 'Ba',
    specialite: 'Parc national du Niokolo-Koba et faune',
    region: 'Tambacounda',
    telephone: '+221 75 000 00 06',
    email: 'ibrahima.ba@example.com',
    note: 4.5,
    disponible: true,
  },
];

/**
 * Service central de gestion des guides : toutes les lectures et écritures
 * passent par ici (les composants ne gardent aucune donnée).
 *
 * Les guides sont dans un `signal` : quand on ajoute, modifie ou supprime,
 * Angular prévient automatiquement les composants qui lisent `getGuides()`
 * (par exemple le `computed` de la liste), qui se mettent à jour seuls.
 */
@Injectable({
  providedIn: 'root',
})
export class GuideService {
  private readonly guides = signal<GuideTouristique[]>(DONNEES_DEMO.map((g) => ({ ...g })));

  /** Tous les guides (lecture seule). Lire cette méthode dans un `computed` crée la dépendance. */
  getGuides(): GuideTouristique[] {
    return this.guides();
  }

  /** Un guide par identifiant, ou `undefined` s'il n'existe pas. */
  getGuideById(id: number): GuideTouristique | undefined {
    return this.guides().find((g) => g.id === id);
  }

  /**
   * Prochain identifiant libre : plus grand id existant + 1.
   * Liste vide → 1. On ne réutilise jamais l'id d'un guide supprimé
   * qui se trouve au milieu (ex. ids 1,2,4,5 → 6, pas 3).
   */
  prochainId(): number {
    return Math.max(0, ...this.guides().map((g) => g.id)) + 1;
  }

  /** Ajoute un guide ; l'identifiant est attribué ici, jamais par le formulaire. */
  addGuide(donnees: NouveauGuide): GuideTouristique {
    const guide: GuideTouristique = { ...donnees, id: this.prochainId() };
    this.guides.update((liste) => [...liste, guide]);
    return guide;
  }

  /** Remplace le guide qui a le même `id`. Renvoie `false` si aucun guide ne correspond. */
  updateGuide(guide: GuideTouristique): boolean {
    if (!this.getGuideById(guide.id)) {
      return false;
    }
    this.guides.update((liste) => liste.map((g) => (g.id === guide.id ? { ...guide } : g)));
    return true;
  }

  /** Supprime un guide. Renvoie `false` si aucun guide ne correspond. */
  deleteGuide(id: number): boolean {
    if (!this.getGuideById(id)) {
      return false;
    }
    this.guides.update((liste) => liste.filter((g) => g.id !== id));
    return true;
  }

  /** `true` si l'e-mail est déjà pris (hors guide `ignorerId`, utile en modification). */
  emailExiste(email: string, ignorerId?: number): boolean {
    const cible = email.trim().toLowerCase();
    return this.guides().some((g) => g.id !== ignorerId && g.email.trim().toLowerCase() === cible);
  }
}
