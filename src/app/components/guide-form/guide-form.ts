import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GuideTouristique } from '../../models/guide-touristique.model';
import { REGIONS_SENEGAL } from '../../models/regions';
import { GuideService, NouveauGuide } from '../../services/guide';
import { NotificationService } from '../../services/notification';

/** Noms des champs du formulaire (évite les fautes de frappe dans le code). */
type NomChamp =
  'prenom' | 'nom' | 'specialite' | 'region' | 'telephone' | 'email' | 'note' | 'disponible';

/** Description d'un champ texte : le template les affiche avec une seule boucle `@for`. */
interface ChampTexte {
  nom: 'prenom' | 'nom' | 'specialite' | 'telephone' | 'email';
  libelle: string;
  type: 'text' | 'tel' | 'email';
  autocomplete: string;
  aide?: string;
}

/** Libellé utilisé dans les messages d'erreur (« Le prénom est obligatoire. »). */
const LIBELLES_ERREUR: Record<NomChamp, string> = {
  prenom: 'Le prénom',
  nom: 'Le nom',
  specialite: 'La spécialité',
  region: 'La région',
  telephone: 'Le téléphone',
  email: "L'e-mail",
  note: 'La note',
  disponible: 'La disponibilité',
};

// ---------------------------------------------------------------------------
// Validateurs personnalisés
// ---------------------------------------------------------------------------

/** Texte obligatoire d'au moins `min` caractères, espaces au début et à la fin ignorés. */
function texteRequis(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const texte = String(control.value ?? '').trim();
    if (texte.length === 0) {
      return { required: true };
    }
    if (texte.length < min) {
      return { minlength: { requiredLength: min, actualLength: texte.length } };
    }
    return null;
  };
}

/** Adresse e-mail de la forme nom@domaine.ext (la présence du champ est vérifiée ailleurs). */
const emailValide: ValidatorFn = (control) => {
  const valeur = String(control.value ?? '').trim();
  if (valeur === '') {
    return null;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur) ? null : { email: true };
};

/**
 * Numéro sénégalais : mobile (70, 75, 76, 77, 78) ou fixe (33) + 7 chiffres,
 * avec ou sans indicatif (+221 ou 00221). Espaces, points et tirets tolérés.
 * Exemples valides : « +221 77 000 00 00 », « 78 000 00 00 », « 33 800 00 00 ».
 */
const telephoneSenegal: ValidatorFn = (control) => {
  const compact = String(control.value ?? '').replace(/[\s.-]/g, '');
  if (compact === '') {
    return null;
  }
  return /^(?:\+221|00221)?(?:7[05678]|33)\d{7}$/.test(compact) ? null : { telephone: true };
};

@Component({
  selector: 'app-guide-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './guide-form.html',
  styleUrl: './guide-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideForm {
  private readonly guideService = inject(GuideService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly hote = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Identifiant dans l'adresse (`/guides/3/modifier`), ou `null` pour un ajout (`/guides/nouveau`). */
  private readonly idUrl = inject(ActivatedRoute).snapshot.paramMap.get('id');

  /** Guide en cours de modification (`undefined` en mode ajout ou si l'id n'existe pas). */
  private readonly guideAModifier: GuideTouristique | undefined =
    this.idUrl === null ? undefined : this.guideService.getGuideById(Number(this.idUrl));

  readonly modeModification = this.idUrl !== null;

  /** Mode modification, mais aucun guide ne porte cet identifiant. */
  readonly introuvable = this.modeModification && this.guideAModifier === undefined;

  readonly regions = REGIONS_SENEGAL;

  readonly champsTexte: readonly ChampTexte[] = [
    { nom: 'prenom', libelle: 'Prénom', type: 'text', autocomplete: 'given-name' },
    { nom: 'nom', libelle: 'Nom', type: 'text', autocomplete: 'family-name' },
    {
      nom: 'specialite',
      libelle: 'Spécialité',
      type: 'text',
      autocomplete: 'off',
      aide: 'Ex : écotourisme, patrimoine historique…',
    },
    {
      nom: 'telephone',
      libelle: 'Téléphone',
      type: 'tel',
      autocomplete: 'tel',
      aide: 'Ex : +221 77 000 00 00',
    },
    {
      nom: 'email',
      libelle: 'E-mail',
      type: 'email',
      autocomplete: 'email',
      aide: 'Ex : prenom.nom@example.com',
    },
  ];

  /** Passe à `true` au premier clic sur « Enregistrer » : les erreurs s'affichent alors même sur les champs non touchés. */
  protected readonly tentativeEnvoi = signal(false);

  readonly formulaire = new FormGroup({
    prenom: new FormControl('', { nonNullable: true, validators: [texteRequis(2)] }),
    nom: new FormControl('', { nonNullable: true, validators: [texteRequis(2)] }),
    specialite: new FormControl('', { nonNullable: true, validators: [texteRequis(3)] }),
    region: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telephone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, telephoneSenegal],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, emailValide],
    }),
    note: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(5),
    ]),
    disponible: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    if (this.guideAModifier) {
      const { id: _id, ...donnees } = this.guideAModifier;
      this.formulaire.setValue(donnees);
    }
  }

  /** Titre de la page selon le mode. */
  get titre(): string {
    if (!this.modeModification) {
      return 'Ajouter un guide';
    }
    return this.guideAModifier
      ? `Modifier la fiche de ${this.guideAModifier.prenom} ${this.guideAModifier.nom}`
      : 'Guide introuvable';
  }

  /**
   * Message d'erreur à afficher pour un champ, ou `null` s'il n'y a rien à dire.
   * Une erreur n'apparaît qu'après avoir quitté le champ (« touched ») ou tenté d'enregistrer.
   */
  messageErreur(champ: NomChamp): string | null {
    const controle = this.formulaire.controls[champ];
    if (!controle.invalid || !(controle.touched || this.tentativeEnvoi())) {
      return null;
    }
    const erreurs = controle.errors ?? {};
    const libelle = LIBELLES_ERREUR[champ];

    if (erreurs['required']) {
      return champ === 'region'
        ? `${libelle} est obligatoire : choisissez-en une.`
        : `${libelle} est obligatoire.`;
    }
    if (erreurs['minlength']) {
      return `${libelle} doit contenir au moins ${erreurs['minlength'].requiredLength} caractères.`;
    }
    if (erreurs['email']) {
      return 'Saisissez une adresse e-mail valide, par exemple prenom.nom@example.com.';
    }
    if (erreurs['doublon']) {
      return 'Cet e-mail est déjà utilisé par un autre guide.';
    }
    if (erreurs['telephone']) {
      return 'Numéro invalide : 9 chiffres commençant par 70, 75, 76, 77, 78 ou 33 (indicatif +221 facultatif).';
    }
    if (erreurs['min'] || erreurs['max']) {
      return 'La note doit être comprise entre 0 et 5.';
    }
    return `${libelle} n'est pas valide.`;
  }

  soumettre(): void {
    this.tentativeEnvoi.set(true);

    // Règle métier : un e-mail ne peut appartenir qu'à un seul guide.
    const email = this.formulaire.controls.email;
    if (email.valid && this.guideService.emailExiste(email.value, this.guideAModifier?.id)) {
      email.setErrors({ doublon: true });
    }

    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      this.notification.erreur(
        'Le formulaire contient des erreurs : corrigez les champs signalés.',
      );
      this.focaliserPremierChampInvalide();
      return;
    }

    const valeurs = this.formulaire.getRawValue();
    const donnees: NouveauGuide = {
      prenom: valeurs.prenom.trim(),
      nom: valeurs.nom.trim(),
      specialite: valeurs.specialite.trim(),
      region: valeurs.region,
      telephone: valeurs.telephone.trim(),
      email: valeurs.email.trim(),
      note: Number(valeurs.note),
      disponible: valeurs.disponible,
    };
    const nomComplet = `${donnees.prenom} ${donnees.nom}`;

    try {
      if (this.guideAModifier) {
        if (!this.guideService.updateGuide({ ...donnees, id: this.guideAModifier.id })) {
          throw new Error('Guide introuvable');
        }
        this.notification.succes(`La fiche de ${nomComplet} a été modifiée.`);
      } else {
        this.guideService.addGuide(donnees);
        this.notification.succes(`Le guide ${nomComplet} a été ajouté au répertoire.`);
      }
      void this.router.navigate(['/guides']);
    } catch {
      this.notification.erreur(
        "L'enregistrement a échoué. Vérifiez les informations puis réessayez.",
      );
    }
  }

  /** Place le curseur sur le premier champ en erreur (utile au clavier et aux lecteurs d'écran). */
  private focaliserPremierChampInvalide(): void {
    const noms = Object.keys(this.formulaire.controls) as NomChamp[];
    const premier = noms.find((nom) => this.formulaire.controls[nom].invalid);
    this.hote.nativeElement.querySelector<HTMLElement>(`#champ-${premier}`)?.focus();
  }
}
