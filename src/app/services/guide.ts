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
      prenom: 'Mamadou',
      specialite: 'Mangroves et écotourisme',
      region: 'Ziguinchor',
      telephone: '+221 77 123 45 67',
      email: 'mamadou.bakhoum@uasz.edu.sn',
      note: 4.8,
      disponible: true
    },
    {
      id: 2,
      nom: 'Sagna',
      prenom: 'Fatou',
      specialite: 'Patrimoine culturel et traditions',
      region: 'Ziguinchor',
      telephone: '+221 76 987 65 43',
      email: 'fatou.sagna@uasz.edu.sn',
      note: 4.5,
      disponible: false
    },
    {
      id: 3,
      nom: 'Faye',
      prenom: 'Ousmane',
      specialite: 'Salines et traditions du Sine-Saloum',
      region: 'Fatick',
      telephone: '+221 78 456 78 90',
      email: 'ousmane.faye@uasz.edu.sn',
      note: 4.9,
      disponible: true
    }
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