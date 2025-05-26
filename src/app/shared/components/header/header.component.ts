import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public auth = inject(AuthService);
  private router = inject(Router);
  currentLang = 'ar';
  isHome = false;

  ngOnInit(){
    this.currentLang = localStorage.getItem('lang')!;
    this.isHomePage();
  }

  isHomePage(): void {
    this.router.events.subscribe(() => {
      this.isHome = this.router.url === '/home';
    })
  }


}
