import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Page affichée quand l'adresse demandée n'existe pas. */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="introuvable" aria-labelledby="titre-404">
      <h2 id="titre-404">Page introuvable</h2>
      <p>L'adresse demandée n'existe pas dans cette application.</p>
      <a routerLink="/guides" class="btn btn-primary">Retour au répertoire</a>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .introuvable {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem 1rem;
      text-align: center;
      background: #fafafa;
      border: 2px dashed var(--bord);
      border-radius: 10px;
    }
    h2 {
      margin-top: 0;
      color: var(--vert);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
