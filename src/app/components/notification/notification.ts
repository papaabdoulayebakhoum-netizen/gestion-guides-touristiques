import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification';

/** Zone d'affichage des messages de succès ou d'erreur (annoncés aux lecteurs d'écran). */
@Component({
  selector: 'app-notification',
  templateUrl: './notification.html',
  styleUrl: './notification.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  protected readonly notification = inject(NotificationService);
}
