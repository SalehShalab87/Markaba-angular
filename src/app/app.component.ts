import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
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
  }
}
