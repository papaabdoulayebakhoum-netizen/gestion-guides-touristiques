import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { GuideService } from '../../services/guide';
import { NotificationService } from '../../services/notification';
import { GuideForm } from './guide-form';

/** Crée le formulaire, en mode ajout (`id` absent) ou modification (`id` = identifiant). */
async function creer(id?: number) {
  await TestBed.configureTestingModule({
    imports: [GuideForm],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap(id === undefined ? {} : { id: String(id) }) },
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(GuideForm);
  await fixture.whenStable();
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  return {
    fixture,
    composant: fixture.componentInstance,
    service: TestBed.inject(GuideService),
    notification: TestBed.inject(NotificationService),
    navigate,
  };
}

const VALIDE = {
  prenom: 'Khady',
  nom: 'Mbaye',
  specialite: 'Artisanat et marchés',
  region: 'Kaolack',
  telephone: '+221 77 000 00 97',
  email: 'khady.mbaye@example.com',
  note: 4.2,
  disponible: true,
};

describe('GuideForm — ajout', () => {
  it('est invalide et affiche des erreurs quand on enregistre à vide', async () => {
    const { fixture, composant, service, notification } = await creer();
    const avant = service.getGuides().length;

    composant.soumettre();
    await fixture.whenStable();

    expect(composant.formulaire.invalid).toBe(true);
    expect(service.getGuides().length).toBe(avant);
    expect(notification.message()?.type).toBe('erreur');
    expect(composant.messageErreur('prenom')).toContain('obligatoire');
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.erreur').length,
    ).toBeGreaterThanOrEqual(7);
  });

  it('vérifie les longueurs minimales (et ignore les espaces)', async () => {
    const { composant } = await creer();
    composant.formulaire.patchValue({ prenom: ' A ', nom: 'B', specialite: 'ab' });
    expect(composant.formulaire.controls.prenom.errors?.['minlength']).toBeTruthy();
    expect(composant.formulaire.controls.nom.errors?.['minlength']).toBeTruthy();
    expect(composant.formulaire.controls.specialite.errors?.['minlength']).toBeTruthy();
    composant.formulaire.patchValue({ prenom: '   ' });
    expect(composant.formulaire.controls.prenom.errors?.['required']).toBeTruthy();
  });

  it("valide l'e-mail", async () => {
    const { composant } = await creer();
    const email = composant.formulaire.controls.email;
    for (const mauvais of ['abc', 'a@b', 'a@b.', 'a b@c.com', '@x.com']) {
      email.setValue(mauvais);
      expect(email.errors?.['email'], mauvais).toBeTruthy();
    }
    for (const bon of ['a@b.sn', 'prenom.nom@example.com']) {
      email.setValue(bon);
      expect(email.valid, bon).toBe(true);
    }
  });

  it('valide le téléphone sénégalais', async () => {
    const { composant } = await creer();
    const tel = composant.formulaire.controls.telephone;
    for (const bon of [
      '+221 77 000 00 00',
      '77 000 00 00',
      '770000000',
      '00221 78 000 00 00',
      '33 800 00 00',
    ]) {
      tel.setValue(bon);
      expect(tel.valid, bon).toBe(true);
    }
    for (const mauvais of [
      '123',
      '+221 99 000 00 00',
      '77 000 00',
      'abcdefghi',
      '+33 6 12 34 56 78',
    ]) {
      tel.setValue(mauvais);
      expect(tel.errors?.['telephone'], mauvais).toBeTruthy();
    }
  });

  it('refuse une note hors de 0 à 5', async () => {
    const { composant } = await creer();
    const note = composant.formulaire.controls.note;
    note.setValue(5.1);
    expect(note.errors?.['max']).toBeTruthy();
    note.setValue(-1);
    expect(note.errors?.['min']).toBeTruthy();
    note.setValue(0);
    expect(note.valid).toBe(true);
  });

  it('ajoute le guide, affiche un succès et retourne à la liste', async () => {
    const { composant, service, notification, navigate } = await creer();
    const avant = service.getGuides().length;
    composant.formulaire.setValue(VALIDE);

    composant.soumettre();

    expect(service.getGuides().length).toBe(avant + 1);
    expect(service.getGuides().at(-1)?.email).toBe(VALIDE.email);
    expect(notification.message()?.type).toBe('succes');
    expect(navigate).toHaveBeenCalledWith(['/guides']);
  });

  it('refuse un e-mail déjà utilisé', async () => {
    const { composant, service, notification } = await creer();
    const avant = service.getGuides().length;
    composant.formulaire.setValue({ ...VALIDE, email: service.getGuides()[0].email.toUpperCase() });

    composant.soumettre();

    expect(service.getGuides().length).toBe(avant);
    expect(composant.messageErreur('email')).toContain('déjà utilisé');
    expect(notification.message()?.type).toBe('erreur');
  });
});

describe('GuideForm — modification', () => {
  it('pré-remplit le formulaire avec le guide existant', async () => {
    const { composant, service } = await creer(1);
    const guide = service.getGuideById(1)!;
    expect(composant.modeModification).toBe(true);
    expect(composant.formulaire.getRawValue().email).toBe(guide.email);
    expect(composant.titre).toContain(guide.nom);
  });

  it('enregistre les changements sans créer de doublon', async () => {
    const { composant, service, notification, navigate } = await creer(1);
    const avant = service.getGuides().length;
    composant.formulaire.patchValue({ region: 'Louga', note: 3.5 });

    composant.soumettre();

    expect(service.getGuides().length).toBe(avant);
    expect(service.getGuideById(1)?.region).toBe('Louga');
    expect(service.getGuideById(1)?.note).toBe(3.5);
    expect(notification.message()?.type).toBe('succes');
    expect(navigate).toHaveBeenCalledWith(['/guides']);
  });

  it('accepte de garder son propre e-mail', async () => {
    const { composant, service } = await creer(1);
    composant.soumettre();
    expect(composant.formulaire.controls.email.errors).toBeNull();
    expect(service.getGuideById(1)).toBeTruthy();
  });

  it('affiche « introuvable » pour un identifiant inconnu', async () => {
    const { fixture, composant } = await creer(999);
    expect(composant.introuvable).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Aucun guide ne correspond',
    );
    expect((fixture.nativeElement as HTMLElement).querySelector('form')).toBeNull();
  });
});
