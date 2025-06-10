import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from '../../../core/services/main/toast.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";


@Component({
  selector: 'app-register-client',
  imports: [ReactiveFormsModule, CommonModule, TranslatePipe, LoaderComponent],
  templateUrl: './register-client.component.html',
  styleUrl: './register-client.component.scss',
})
export class RegisterClientComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  subscriptions: Subscription[] = [];
  isLoading = false;

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
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-()]+$/),]],
      address: ['', Validators.required],
      role: ['client'],
    });
  }


  onRegister(): void {
    this.isLoading = true;
    if (this.registerForm.invalid) {
      this.isLoading = false;
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();
    const { confirmPassword, ...newUser } = formValue;
    this.subscriptions.push(
      this.authService.isUserEmailExists(newUser.email).subscribe({
        next: (users: User[]) => {
          if (users.length > 0) {
            this.isLoading = false;
            this.registerForm.get('email')?.setErrors({ emailExists: true });
          } else {
            this.subscriptions.push(
              this.authService.registerUser(newUser).subscribe({
                next: () => {
                  this.isLoading = false;
                  const successTranslationKey = 'toast.success.register'; 
                  this.toast.showSuccess(successTranslationKey);
                  this.authService.redirectUserByRole();
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
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
  }
}
