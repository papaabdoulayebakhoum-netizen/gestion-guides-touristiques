import { Injectable, signal } from '@angular/core';

export type TypeNotification = 'succes' | 'erreur';

export interface Notification {
  type: TypeNotification;
  texte: string;
}

/** Durée d'affichage d'un message avant disparition automatique (ms). */
const DUREE_AFFICHAGE_MS = 6000;

/**
 * Messages de succès ou d'erreur affichés en haut de l'écran.
 * Un message survit à un changement de page (ex. « Guide ajouté » après
 * la redirection du formulaire vers la liste).
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _message = signal<Notification | null>(null);
  private minuteur: ReturnType<typeof setTimeout> | undefined;

  /** Message courant, ou `null` s'il n'y en a pas. */
  readonly message = this._message.asReadonly();

  succes(texte: string): void {
    this.afficher({ type: 'succes', texte });
  }

  erreur(texte: string): void {
    this.afficher({ type: 'erreur', texte });
  }

  fermer(): void {
    clearTimeout(this.minuteur);
    this._message.set(null);
  }

  private afficher(notification: Notification): void {
    clearTimeout(this.minuteur);
    this._message.set(notification);
    this.minuteur = setTimeout(() => this._message.set(null), DUREE_AFFICHAGE_MS);
  }
}
