import { Component } from '@angular/core';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about-us',
  imports: [TranslatePipe],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  currentLang = 'en';

  constructor() {
    this.currentLang = localStorage.getItem('lang') || 'en';
  }

}
