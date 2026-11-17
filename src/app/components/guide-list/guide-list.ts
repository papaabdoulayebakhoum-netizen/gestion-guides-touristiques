import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { GuideService } from '../../services/guide';
import { NoteFormatPipe } from '../../pipes/note-format-pipe';

/** Statut affiché et filtré : déduit du champ booléen `disponible` du modèle. */
type FiltreStatut = '' | 'disponible' | 'indisponible';

/** Minuscules + sans accents : "Éco" et "eco" deviennent équivalents. */
function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

@Component({
  selector: 'app-guide-list',
  imports: [NoteFormatPipe],
  templateUrl: './guide-list.html',
  styleUrl: './guide-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideList {
  private readonly guideService = inject(GuideService);

  /** Toutes les données (source unique : le service). */
  readonly guides = computed(() => this.guideService.getGuides());

  // --- Critères de recherche et de filtre (Part B + Part C) ---
  readonly recherche = signal('');
  readonly regionChoisie = signal('');
  readonly statutChoisi = signal<FiltreStatut>('');

  /** Régions déduites des données, triées, sans doublon. */
  readonly regions = computed(() =>
    [...new Set(this.guides().map((g) => g.region))].sort((a, b) =>
      a.localeCompare(b, 'fr'),
    ),
  );

  /** Guides après recherche + filtre région + filtre statut. */
  readonly guidesFiltres = computed(() => {
    const mots = normaliser(this.recherche()).split(/\s+/).filter(Boolean);
    const region = this.regionChoisie();
    const statut = this.statutChoisi();

    return this.guides().filter((g) => {
      if (region && g.region !== region) return false;
      if (statut === 'disponible' && !g.disponible) return false;
      if (statut === 'indisponible' && g.disponible) return false;
      if (mots.length === 0) return true;
      const texte = normaliser(`${g.prenom} ${g.nom} ${g.specialite}`);
      return mots.every((mot) => texte.includes(mot));
    });
  });

  readonly filtresActifs = computed(
    () => !!(this.recherche().trim() || this.regionChoisie() || this.statutChoisi()),
  );

  onRecherche(event: Event): void {
    this.recherche.set((event.target as HTMLInputElement).value);
  }

  onRegion(event: Event): void {
    this.regionChoisie.set((event.target as HTMLSelectElement).value);
  }

  onStatut(event: Event): void {
    this.statutChoisi.set((event.target as HTMLSelectElement).value as FiltreStatut);
  }

  reinitialiser(): void {
    this.recherche.set('');
    this.regionChoisie.set('');
    this.statutChoisi.set('');
  }
}