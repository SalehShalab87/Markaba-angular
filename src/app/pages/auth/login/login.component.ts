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
import { PasswordModule } from 'primeng/password';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,RouterLink,CommonModule,PasswordModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  subscription!: Subscription;
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

  onLogin(): void {
    this.isLoading = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.subscription = this.authService
      .isUserExists(email, password)
      .subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            this.isLoading = false;
            this.toast.showSuccess('Login successful');
            this.authService.login(users[0]);
            this.loginForm.reset();
          } else {
            this.toast.showError('Invalid email or password');
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
