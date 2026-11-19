import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuideTouristique } from '../../models/guide-touristique.model';
import { GuideService } from '../../services/guide';
import { NotificationService } from '../../services/notification';
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
  imports: [NoteFormatPipe, RouterLink],
  templateUrl: './guide-list.html',
  styleUrl: './guide-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideList {
  private readonly guideService = inject(GuideService);
  private readonly notification = inject(NotificationService);

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

  // --- Suppression avec confirmation (Part D) ---

  /** Guide en attente de confirmation de suppression (`null` : aucune demande en cours). */
  readonly guideASupprimer = signal<GuideTouristique | null>(null);

  private readonly dialogue = viewChild<ElementRef<HTMLDialogElement>>('dialogueSuppression');

  /** Ouvre la boîte de confirmation (le navigateur gère le focus et la touche Échap). */
  demanderSuppression(guide: GuideTouristique): void {
    this.guideASupprimer.set(guide);
    this.dialogue()?.nativeElement.showModal();
  }

  confirmerSuppression(): void {
    const guide = this.guideASupprimer();
    if (!guide) {
      return;
    }
    if (this.guideService.deleteGuide(guide.id)) {
      this.notification.succes(`Le guide ${guide.prenom} ${guide.nom} a été supprimé.`);
    } else {
      this.notification.erreur('Suppression impossible : ce guide n\'existe plus.');
    }
    this.fermerDialogue();
  }

  annulerSuppression(): void {
    this.fermerDialogue();
  }

  /** Appelé aussi quand la boîte se ferme avec la touche Échap. */
  onDialogueFermee(): void {
    this.guideASupprimer.set(null);
  }

  private fermerDialogue(): void {
    this.dialogue()?.nativeElement.close();
    this.guideASupprimer.set(null);
  }
}
