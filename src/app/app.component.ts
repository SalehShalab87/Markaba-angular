import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/services/i18n/i18n.service';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from "./shared/components/header/header.component";
import { CommonModule } from '@angular/common';
import { NetworkStatusService } from './core/services/main/network-status.service';
import { ToastService } from './core/services/main/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private i18n = inject(I18nService);
  private networkService = inject(NetworkStatusService);
  private toast = inject(ToastService);
  isRTL =  this.i18n.isRTL$;

  ngOnInit() {
    this.loadTranslationFileFromService();
    this.handleNetworkStatus();
  }

  async loadTranslationFileFromService() {
    const lang = localStorage.getItem('lang') as 'en' | 'ar';
    await this.i18n.loadTranslationFile(lang || 'en');
  }

  handleNetworkStatus(): void {
      this.networkService.onlineStatus$.subscribe({
        next: (isOnline: boolean) => {
          if (!isOnline) {
            const errorTranslationKey = 'toast.error.network';
            this.toast.showError(errorTranslationKey);
          }
        },
      });
  }
}
