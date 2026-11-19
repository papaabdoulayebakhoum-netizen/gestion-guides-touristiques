import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NotificationComponent } from './components/notification/notification';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Guides touristiques du Sénégal');
}
