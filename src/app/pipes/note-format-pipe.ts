import { Pipe, PipeTransform } from '@angular/core';

/** Formate une note sur 5 : 4.5 -> "4,5 / 5". Gère les valeurs absentes. */
@Pipe({
  name: 'noteFormat',
})
export class NoteFormatPipe implements PipeTransform {
  transform(note: number | null | undefined): string {
    if (note === null || note === undefined || Number.isNaN(note)) {
      return 'Non noté';
    }
    const bornee = Math.min(5, Math.max(0, note));
    return `${bornee.toLocaleString('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} / 5`;
  }
}