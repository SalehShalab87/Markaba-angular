import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/services/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private i18n = inject(I18nService);

  ngOnInit(){
    this.loadTranslationFileFromService();
  }

  async loadTranslationFileFromService() {
    const lang = localStorage.getItem('lang') as 'en' | 'ar';
    await this.i18n.loadTranslationFile(lang || 'en');
    console.log(this.i18n.currentLang);
  }
}
