import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
<<<<<<< HEAD
import { AuthService } from './core/services/auth.service';
=======
import { I18nService } from './core/services/i18n/i18n.service';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from "./shared/components/header/header.component";
>>>>>>> 52f8efb438b2d9ca406de16b2e22dd437c50a451

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
<<<<<<< HEAD
  private authService = inject(AuthService);

  ngOnInit() {
    // this.testLogin();
  }

  testLogin() {
    this.authService.IsUserExist('admin@cms.com', 'admin123').subscribe({
      next: (result) => {
        console.log(result);
        this.authService.isLoggedInObservable.subscribe({
          next: () => {},
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
=======
  private i18n = inject(I18nService);

  ngOnInit(){
    this.loadTranslationFileFromService();
  }

  async loadTranslationFileFromService() {
    const lang = localStorage.getItem('lang') as 'en' | 'ar';
    await this.i18n.loadTranslationFile(lang || 'en');
    console.log(this.i18n.currentLang);
>>>>>>> 52f8efb438b2d9ca406de16b2e22dd437c50a451
  }
}
