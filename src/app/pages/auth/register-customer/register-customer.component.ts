import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register-customer',
  imports: [ReactiveFormsModule, CommonModule,TranslatePipe],
  templateUrl: './register-customer.component.html',
  styleUrl: './register-customer.component.scss',
})

export class RegisterCustomerComponent {
  registerForm!: FormGroup;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  subscription: Subscription[] = [];
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  ngOnInit() {
    this.initializeLoginForm();
  }

  initializeLoginForm(): void {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: [''],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        role: ['customer'],
      },
      {
        validators: this.authService.passwordMatchValidator,
      }
    );
  }

  

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const newUser: User = this.registerForm.getRawValue();
    this.subscription.push(
      this.authService.isUserEmailExists(newUser.email).subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            this.toast.showError('Email already exists');
          } else {
            this.subscription.push(
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
    this.subscription?.forEach((sub) => sub.unsubscribe());
  }
}
