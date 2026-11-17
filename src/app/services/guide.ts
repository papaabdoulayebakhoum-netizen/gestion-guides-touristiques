import { Injectable } from '@angular/core';
import { GuideTouristique } from '../models/guide-touristique.model';

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private guides: GuideTouristique[] = [
    {
      id: 1,
      nom: 'Bakhoum',
      prenom: 'Papa Abdoulaye',
      specialite: 'Mangroves et écotourisme',
      region: 'Ziguinchor',
      telephone: '+221 77 123 45 67',
      email: 'papa.bakhoum@uasz.edu.sn',
      note: 4.8,
      disponible: true
    },
    {
      id: 2,
      nom: 'Drame',
      prenom: 'Abdoulaye',
      specialite: 'Patrimoine culturel et traditions',
      region: 'Dakar',
      telephone: '+221 78 309 42 95',
      email: 'adoulaye.drame@uasz.edu.sn',
      note: 4.7,
      disponible: true
    },
    {
      id: 3,
      nom: 'Dabo',
      prenom: 'Mouhamed',
      specialite: 'Salines et traditions du Sine-Saloum',
      region: 'Fatick',
      telephone: '+221 78 456 78 90',
      email: 'mouhamed.dabo@uasz.edu.sn',
      note: 4.9,
      disponible: false
    },
    {
  id: 4,
  nom: 'Ndiaye',
  prenom: 'Cheikh',
  specialite: 'Histoire et patrimoine de Saint-Louis',
  region: 'Saint-Louis',
  telephone: '+221 77 321 45 67',
  email: 'cheikh.ndiaye@example.com',
  note: 4.6,
  disponible: true
},
{
  id: 5,
  nom: 'Camara',
  prenom: 'Aissatou',
  specialite: 'Tourisme balnéaire et découverte des plages',
  region: 'Dakar',
  telephone: '+221 76 543 21 09',
  email: 'aissatou.camara@example.com',
  note: 4.3,
  disponible: false
},  
];

  constructor() { }

  // Récupérer tous les guides
  getGuides(): GuideTouristique[] {
    return this.guides;
  }

  // Ajouter un guide (pour Mouhamed)
  addGuide(guide: GuideTouristique): void {
    this.guides.push(guide);
  }

  // Supprimer un guide
  deleteGuide(id: number): void {
    this.guides = this.guides.filter(g => g.id !== id);
  }
}
