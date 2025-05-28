import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LoaderComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;
  public auth = inject(AuthService);
  private router = inject(Router);
  currentLang = 'en';
  isHome = false;
  isLoading = false;

  ngOnInit() {
    const lang = localStorage.getItem('lang') || 'en';
    this.currentLang = lang;
    this.isHomePage();
  }

  ngAfterViewInit() {
    const collapseEl = document.getElementById('navbarNavAltMarkup');
    if (collapseEl) {
      collapseEl.addEventListener('show.bs.collapse', () => {
        document.body.classList.add('menu-open');
      });
      collapseEl.addEventListener('hide.bs.collapse', () => {
        document.body.classList.remove('menu-open');
      });
    }
  }

  isHomePage(): void {
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/home';
    });
  }

  switchLanguage(lang: 'en' | 'ar'): void {
    this.isLoading = true;
    if (this.currentLang !== lang) {
      setTimeout(() => {
      localStorage.setItem('lang', lang);
      this.currentLang = lang;
      this.isLoading = false;
      window.location.reload();
      }, 2000);
    }
  }
}
