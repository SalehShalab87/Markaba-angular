import { Component, ElementRef, inject, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LoaderComponent } from "../loader/loader.component";
import { I18nService } from '../../../core/services/i18n/i18n.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, LoaderComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, AfterViewInit {
  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;
  public auth = inject(AuthService);
  private router = inject(Router);
  private i18n = inject(I18nService);
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
        this.i18n.loadTranslationFile(lang).then(()=> {
          this.currentLang = lang;
          this.isLoading = false;
        })
      }, 2000);
    }
  }
}
