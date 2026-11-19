import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GuideService } from '../../services/guide';
import { NotificationService } from '../../services/notification';
import { GuideList } from './guide-list';

describe('GuideList', () => {
  let component: GuideList;
  let fixture: ComponentFixture<GuideList>;
  let guideService: GuideService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuideList],
      providers: [provideRouter([])],
    }).compileComponents();

    guideService = TestBed.inject(GuideService);
    fixture = TestBed.createComponent(GuideList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  const cartes = () => (fixture.nativeElement as HTMLElement).querySelectorAll('.carte');

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche un bouton Modifier et un bouton Supprimer par carte', () => {
    expect(cartes().length).toBe(guideService.getGuides().length);
    cartes().forEach((carte) => {
      expect(carte.querySelector('a[href$="/modifier"]')).toBeTruthy();
      expect(carte.querySelector('button.btn-danger-outline')).toBeTruthy();
    });
  });

  it('met la liste à jour quand le service ajoute un guide', async () => {
    const avant = cartes().length;
    guideService.addGuide({
      prenom: 'Nouveau',
      nom: 'Guide',
      specialite: 'Test',
      region: 'Louga',
      telephone: '+221 77 000 00 98',
      email: 'nouveau.guide@example.com',
      note: 4,
      disponible: true,
    });
    await fixture.whenStable();
    expect(cartes().length).toBe(avant + 1);
  });

  it('supprime le guide et affiche un message après confirmation', async () => {
    const notification = TestBed.inject(NotificationService);
    const guide = guideService.getGuides()[0];
    const avant = guideService.getGuides().length;

    // jsdom ne gère pas toujours <dialog> : on remplace showModal/close par des fonctions vides.
    const dialogue = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
    dialogue.showModal = () => undefined;
    dialogue.close = () => undefined;

    component.demanderSuppression(guide);
    expect(component.guideASupprimer()).toEqual(guide);
    component.confirmerSuppression();
    await fixture.whenStable();

    expect(guideService.getGuides().length).toBe(avant - 1);
    expect(cartes().length).toBe(avant - 1);
    expect(notification.message()?.type).toBe('succes');
    expect(component.guideASupprimer()).toBeNull();
  });

  it("n'efface rien quand on annule la suppression", async () => {
    const avant = guideService.getGuides().length;
    const dialogue = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
    dialogue.showModal = () => undefined;
    dialogue.close = () => undefined;

    component.demanderSuppression(guideService.getGuides()[0]);
    component.annulerSuppression();

    expect(guideService.getGuides().length).toBe(avant);
    expect(component.guideASupprimer()).toBeNull();
  });
});
