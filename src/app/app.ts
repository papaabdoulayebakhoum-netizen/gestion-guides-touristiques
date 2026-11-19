import { Component } from '@angular/core';
import { GuideList } from './components/guide-list/guide-list'; // Import du composant d'Abdoulaye

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GuideList], // On l'ajoute ici pour qu'Angular le reconnaisse
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'gestion-guides-touristiques';
}