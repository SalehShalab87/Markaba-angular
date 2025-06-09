import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/services/i18n/i18n.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
 private i18n = inject(I18nService);

  transform(value: string): string {
    return this.i18n.translate(value);
  }
}
