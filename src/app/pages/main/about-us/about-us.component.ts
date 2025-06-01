import { Component, inject } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../core/services/i18n/i18n.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-about-us',
  imports: [TranslatePipe,AsyncPipe],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  private i18n = inject(I18nService);
  isRTL$ = this.i18n.isRTL$;
}
