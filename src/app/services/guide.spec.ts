import { TestBed } from '@angular/core/testing';
import { GuideService, NouveauGuide } from './guide';

const NOUVEAU: NouveauGuide = {
  prenom: 'Test',
  nom: 'Fictif',
  specialite: 'Test de service',
  region: 'Dakar',
  telephone: '+221 77 000 00 99',
  email: 'test.fictif@example.com',
  note: 4,
  disponible: true,
};

describe('GuideService', () => {
  let service: GuideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fournit au moins cinq guides de démonstration de régions différentes', () => {
    const guides = service.getGuides();
    expect(guides.length).toBeGreaterThanOrEqual(5);
    expect(new Set(guides.map((g) => g.region)).size).toBeGreaterThanOrEqual(5);
  });

  it('ajoute un guide avec le prochain id (plus grand id + 1)', () => {
    const avant = service.getGuides().length;
    const maxId = Math.max(...service.getGuides().map((g) => g.id));

    const cree = service.addGuide(NOUVEAU);

    expect(cree.id).toBe(maxId + 1);
    expect(service.getGuides().length).toBe(avant + 1);
    expect(service.getGuideById(cree.id)?.email).toBe(NOUVEAU.email);
  });

  it("ne réutilise pas l'id d'un guide supprimé au milieu de la liste", () => {
    const maxId = Math.max(...service.getGuides().map((g) => g.id));
    service.deleteGuide(2);
    expect(service.prochainId()).toBe(maxId + 1);
  });

  it('renvoie 1 comme premier id quand la liste est vide', () => {
    service.getGuides().forEach((g) => service.deleteGuide(g.id));
    expect(service.getGuides()).toEqual([]);
    expect(service.prochainId()).toBe(1);
  });

  it('modifie un guide existant sans toucher aux autres', () => {
    const original = service.getGuideById(1)!;
    const autre = service.getGuideById(2)!;

    const ok = service.updateGuide({ ...original, region: 'Louga', note: 3.5 });

    expect(ok).toBe(true);
    expect(service.getGuideById(1)?.region).toBe('Louga');
    expect(service.getGuideById(1)?.note).toBe(3.5);
    expect(service.getGuideById(2)).toEqual(autre);
  });

  it('refuse de modifier un guide inconnu', () => {
    expect(service.updateGuide({ ...NOUVEAU, id: 999 })).toBe(false);
  });

  it('supprime un guide, et refuse un id inconnu', () => {
    const avant = service.getGuides().length;
    expect(service.deleteGuide(1)).toBe(true);
    expect(service.getGuides().length).toBe(avant - 1);
    expect(service.getGuideById(1)).toBeUndefined();
    expect(service.deleteGuide(999)).toBe(false);
  });

  it('détecte un e-mail déjà utilisé, sans tenir compte de la casse ni du guide ignoré', () => {
    const guide = service.getGuideById(1)!;
    expect(service.emailExiste(guide.email.toUpperCase())).toBe(true);
    expect(service.emailExiste(guide.email, guide.id)).toBe(false);
    expect(service.emailExiste('inconnu@example.com')).toBe(false);
  });
});
