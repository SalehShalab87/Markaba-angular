import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/services/i18n/i18n.service';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from "./shared/components/header/header.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, HeaderComponent ,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private i18n = inject(I18nService);
  isRTL! : boolean;

  ngOnInit(){
    this.loadTranslationFileFromService().then(() => {
      this.isRTL = this.i18n.checkIfRTL();
    });
  }

  async loadTranslationFileFromService() {
    const lang = localStorage.getItem('lang') as 'en' | 'ar';
    await this.i18n.loadTranslationFile(lang || 'en');
  }
}
