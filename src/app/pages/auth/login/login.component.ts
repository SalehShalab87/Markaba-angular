import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { NetworkStatusService } from '../../../core/services/network-status.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    TranslatePipe,
    LoaderComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private networkService = inject(NetworkStatusService);

  loginForm!: FormGroup;
  subscription: Subscription[] = [];
  showPassword: boolean = false;
  isLoading: boolean = false;

  ngOnInit() {
    this.initializeLoginForm();
  }

  initializeLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  handleNetworkStatus(): void {
    this.subscription.push(
      this.networkService.onlineStatus$.subscribe({
        next: (isOnline: boolean) => {
          if (!isOnline) {
            this.isLoading = false;
            const errorTranslationKey = 'toast.error.network';
            this.toast.showError(errorTranslationKey);
          }
        },
      })
    );
  }

  onLogin(): void {
    this.isLoading = true;
    if (this.loginForm.invalid) {
      this.isLoading = false;
      this.loginForm.markAllAsTouched();
      return;
    }
    this.handleNetworkStatus();

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.subscription.push(
      this.authService.isUserExists(email, password).subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            const user = users[0];
            this.isLoading = false;
            if (user.accountStatus === 'rejected') {
              this.toast.showError('toast.error.accountRejected');
              return;
            }
            const successTranslationKey = 'toast.success.login';
            this.toast.showSuccess(successTranslationKey);
            this.authService.login(user);
            this.loginForm.reset();
          } else {
            this.isLoading = false;
            const errorTranslationKey = 'toast.error.login';
            this.toast.showError(errorTranslationKey);
          }
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription?.forEach((sub) => sub.unsubscribe());
  }
}
