import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Form,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register-client',
  imports: [ReactiveFormsModule, CommonModule,TranslatePipe],
  templateUrl: './register-client.component.html',
  styleUrl: './register-client.component.scss',
})
export class RegisterClientComponent {
  registerForm!: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  subscriptions: Subscription[] = [];

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  ngOnInit() {
    this.initializeRegisterForm();
  }

  initializeRegisterForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      role: ['client'],
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const newUser: User = this.registerForm.getRawValue();
    this.subscriptions.push(
      this.authService.isUserEmailExists(newUser.email).subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            this.toast.showError('Email already exists');
          } else {
            this.subscriptions.push(
              this.authService.registerUser(newUser).subscribe({
                next: () => {
                  this.toast.showSuccess('Registration successful');
                  this.authService.login(newUser);
                  this.registerForm.reset();
                },
                error: () => {
                  this.toast.showError('Registration failed');
                },
              })
            );
          }
        },
        error: () => {
          this.toast.showError('An error occurred while checking email');
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
  }
}
