import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('affiche le titre et la navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const racine = fixture.nativeElement as HTMLElement;
    expect(racine.querySelector('h1')?.textContent).toContain('Guides touristiques du Sénégal');
    expect(racine.querySelectorAll('nav a').length).toBe(2);
  });
});
