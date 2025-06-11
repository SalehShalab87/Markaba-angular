import {
  Component,
  ElementRef,
  inject,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LoaderComponent } from '../loader/loader.component';
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
  isMenuOpen = false; // Track menu state manually

  ngOnInit() {
    const lang = localStorage.getItem('lang') || 'en';
    this.currentLang = lang;
    this.isHomePage();
  }

  ngAfterViewInit() {
    // Add click event listener to close menu when clicking outside
    document.addEventListener('click', (event) => {
      const navbar = document.getElementById('navbarNavAltMarkup');
      const toggler = document.querySelector('.navbar-toggler');

      if (navbar && toggler && this.isMenuOpen) {
        if (
          !navbar.contains(event.target as Node) &&
          !toggler.contains(event.target as Node)
        ) {
          this.closeNavbar();
        }
      }
    });
  }

  isHomePage(): void {
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/home';
    });
  }

  switchLanguage(lang: 'en' | 'ar'): void {
    this.isLoading = true;
    this.closeNavbar();

    if (this.currentLang !== lang) {
      setTimeout(() => {
        this.i18n.loadTranslationFile(lang).then(() => {
          this.currentLang = lang;
          this.isLoading = false;
        });
      }, 2000);
    }
  }

  // Toggle the navbar manually
  toggleNavbar(): void {
    this.isMenuOpen = !this.isMenuOpen;
    const navbar = document.getElementById('navbarNavAltMarkup');

    if (navbar) {
      if (this.isMenuOpen) {
        navbar.classList.add('show');
        document.body.classList.add('menu-open');
      } else {
        navbar.classList.remove('show');
        document.body.classList.remove('menu-open');
      }
    }
  }

  // Method to close the navbar
  closeNavbar(): void {
    this.isMenuOpen = false;
    const navbar = document.getElementById('navbarNavAltMarkup');

    if (navbar) {
      navbar.classList.remove('show');
      document.body.classList.remove('menu-open');
    }
  }

  // Method to handle navigation clicks
  onNavClick(): void {
    this.closeNavbar();
  }

  // Method to handle logout
  onLogout(): void {
    this.closeNavbar();
    this.auth.logout();
  }
}
