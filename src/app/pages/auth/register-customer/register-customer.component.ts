import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ToastService } from '../../../core/services/main/toast.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
  selector: 'app-register-customer',
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe, LoaderComponent],
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
  isLoading: boolean = false;

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
        phone: [
          '',
          [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/)],],
        role: ['customer'],
      },
      {
        validators: this.authService.passwordMatchValidator,
      }
    );
  }
  

  onRegister(): void {
    this.isLoading = true;
    if (this.registerForm.invalid) {
      this.isLoading = false;
      this.registerForm.markAllAsTouched();
      return;
    }
    const newUser: User = this.registerForm.getRawValue();
    this.subscription.push(
      this.authService.isUserEmailExists(newUser.email).subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            this.isLoading = false;
            this.registerForm.get('email')?.setErrors({ emailExists: true });
          } else {
            this.isLoading = true;
            this.subscription.push(
              this.authService.registerUser(newUser).subscribe({
                next: () => {
                  this.isLoading = false;
                  const successTranslationKey = 'toast.success.register';
                  this.toast.showSuccess(successTranslationKey);
                  this.authService.login(newUser);
                  this.registerForm.reset();
                },
                error: () => {
                  this.isLoading = false;
                  const errorTranslationKey = 'toast.error.register';
                  this.toast.showError(errorTranslationKey);
                },
              })
            );
          }
        },
        error: () => {
          this.isLoading = false;
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription?.forEach((sub) => sub.unsubscribe());
  }
}
