import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin/admin.service';
import { Subscription } from 'rxjs';
import { User } from '../../../models/user.model';
import { ToastService } from '../../../core/services/main/toast.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, CommonModule, LoaderComponent],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.scss',
})
export class AdminProfileComponent {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  isEditingProfile = false;
  subscriptions: Subscription[] = [];
  isLoading = false;
  private adminInfo!: User;
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private toast  = inject(ToastService);
  private auth = inject(AuthService);

  constructor() {
    this.profileForm = this.fb.group({
      name: [{ value: ''}, [Validators.required]],
      email: [
        { value: ''},
        [Validators.required, Validators.email],
      ],
      phone: [{ value: ''}],
    });

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmNewPassword: ['', [Validators.required]],
      },
      { validators: this.auth.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.loadAdminProfile();
  }

  loadAdminProfile() {
    this.isLoading = true;
    this.subscriptions.push(
      this.adminService.getAdminProfile().subscribe({
        next: (profile) => {
          if (profile && profile.length > 0) {
            this.isLoading = false;
            this.adminInfo = profile[0];
            this.profileForm.patchValue({
              name: this.adminInfo.name,
              email: this.adminInfo.email,
              phone: this.adminInfo.phone,
            });
          }
        },
        error: () => (this.isLoading = false),
      })
    );
  }

  onProfileSubmit() {
    if (this.profileForm.invalid) return;
    const updatedAdminInfo = {...this.adminInfo}
    updatedAdminInfo.name = this.profileForm.get('name')?.value;
    updatedAdminInfo.email = this.profileForm.get('email')?.value;
    updatedAdminInfo.phone = this.profileForm.get('phone')?.value;
    this.subscriptions.push(this.adminService.updateAdminProfile(updatedAdminInfo).subscribe({
      next: (res:User[]) =>{
        const translationKey = 'toast.success.editProfile';
        this.adminInfo = res[0];
        this.toast.showSuccess(translationKey)
        this.isLoading =false;
      },
      error: () => this.isLoading =false,
    }));
    this.isEditingProfile = false;
  }

  onCancelEdit() {
    this.profileForm.reset(this.profileForm.getRawValue());
    this.isEditingProfile = false;
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) return;
    this.isLoading = true;
    const oldPasswordHashed = window.btoa(this.passwordForm.get('oldPassword')?.value);
    if (oldPasswordHashed !== this.adminInfo.password) {
      this.toast.showError('toast.error.wrongOldPassword');
      this.isLoading = false;
      this.passwordForm.reset();
      return;
    }
    const newPassword = this.passwordForm.get('newPassword')?.value;
    this.isLoading = true;
    this.subscriptions.push(
      this.adminService.updateAdminPassword(this.adminInfo.id, newPassword).subscribe({
        next: () => {
          this.isLoading = false;
          this.toast.showSuccess('toast.success.passwordUpdated');
          this.passwordForm.reset();
        },
        error: () => (this.isLoading = false),
      })
    );
  }
}
