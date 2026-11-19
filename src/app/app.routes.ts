import { Routes } from '@angular/router';
import { GuideForm } from './components/guide-form/guide-form';
import { GuideList } from './components/guide-list/guide-list';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  { path: '', redirectTo: 'guides', pathMatch: 'full' },
  { path: 'guides', component: GuideList, title: 'Répertoire des guides' },
  { path: 'guides/nouveau', component: GuideForm, title: 'Ajouter un guide' },
  { path: 'guides/:id/modifier', component: GuideForm, title: 'Modifier un guide' },
  { path: '**', component: NotFound, title: 'Page introuvable' },
];
