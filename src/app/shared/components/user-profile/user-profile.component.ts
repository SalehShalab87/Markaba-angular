// user-profile.component.ts
import { Component, inject, OnInit, OnDestroy, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { User, UserRole } from '../../../models/user.model';
import { ToastService } from '../../../core/services/main/toast.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoaderComponent } from '../loader/loader.component';
import { HomeService } from '../../../core/services/main/home.service';
import { ClientService } from '../../../core/services/client/client.service'; // ✅ Import ClientService for upload
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, CommonModule, LoaderComponent, DatePicker],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private homeService = inject(HomeService);
  private clientService = inject(ClientService);
  private toast = inject(ToastService);

  @Input() userRole: UserRole = 'admin';

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  currentUser: User | null = null;
  isEditingProfile = false;
  isLoading = false;
  isUploading = false; 
  uploadProgress = 0; 
  subscriptions: Subscription[] = [];

  constructor() {
    this.currentUser = this.authService.currentUser();
    this.userRole = this.currentUser?.role || 'admin';
    this.initializeForms();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initializeForms() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s-()]+$/)]],
      address: [''],
      dateOfBirth: [''],
      profileImage: [''], 
    });

    this.applyRoleSpecificValidation();

    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmNewPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private applyRoleSpecificValidation() {
    if (this.userRole === 'client' || this.userRole === 'customer') {
      this.profileForm
        .get('phone')
        ?.setValidators([
          Validators.required,
          Validators.pattern(/^\+?[\d\s-()]+$/),
        ]);
    }

    this.profileForm.updateValueAndValidity();
  }

  private loadUserProfile() {
    this.isLoading = true;

    if (!this.currentUser) {
      this.isLoading = false;
      this.toast.showError('profile.noUser');
      return;
    }

    this.subscriptions.push(
      this.homeService.getUserById(this.currentUser.id).subscribe({
        next: (profile: User) => {
          this.isLoading = false;
          if (profile) {
            this.currentUser = profile;
            this.populateForm();
          }
        },
        error: (error: Error) => {
          this.isLoading = false;
          console.error(`Error loading ${this.userRole} profile:`, error);
          this.toast.showError('profile.loadError');
        },
      })
    );
  }

  private populateForm() {
    if (!this.currentUser) return;

    this.profileForm.patchValue({
      name: this.currentUser.name || '',
      email: this.currentUser.email || '',
      phone: this.currentUser.phone || '',
      address: this.currentUser.address || '',
      dateOfBirth: this.currentUser.dateOfBirth || '',
      profileImage: this.currentUser.profileImage || '',
    });
  }


  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;


    if (!file.type.startsWith('image/')) {
      this.toast.showError('profile.invalidImageType');
      return;
    }


    if (file.size > 5 * 1024 * 1024) {
      this.toast.showError('profile.imageTooLarge');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      await this.uploadProfileImage(file);
    } catch (error) {
      console.error('Upload failed:', error);
      this.toast.showError('profile.uploadError');
    } finally {
      this.isUploading = false;
      this.uploadProgress = 0;
      // ✅ Clear the file input
      (event.target as HTMLInputElement).value = '';
    }
  }


  private uploadProfileImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService
        .uploadImage(file)
        .pipe(finalize(() => resolve()))
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(
                100 * (event.loaded / (event.total || 1))
              );
            } else if (event.type === HttpEventType.Response) {

              const imageUrl = event.body?.secure_url;
              if (imageUrl) {
                this.profileForm.patchValue({
                  profileImage: imageUrl,
                });
                this.toast.showSuccess('profile.imageUploaded');
              }
            }
          },
          error: (err) => {
            console.error('Upload error:', err);
            this.toast.showError('profile.uploadError');
            reject(err);
          },
        });
    });
  }


  removeProfileImage() {
    this.profileForm.patchValue({
      profileImage: '',
    });
    this.currentUser!.profileImage = '';
    this.authService.updateCurrentUser(this.currentUser!);
    this.isEditingProfile = true; 
    this.toast.showSuccess('profile.imageRemoved');
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || !this.currentUser) return;

    this.isLoading = true;
    const updatedUser = { ...this.currentUser, ...this.profileForm.value };

    this.subscriptions.push(
      this.homeService.updateUserProfile(updatedUser).subscribe({
        next: (response: User) => {
          this.isLoading = false;
          this.currentUser = Array.isArray(response) ? response[0] : response;
          this.toast.showSuccess('profile.updateSuccess');
          this.isEditingProfile = false;

          this.authService.updateCurrentUser(this.currentUser!);
        },
        error: (error: Error) => {
          this.isLoading = false;
          console.error(`Error updating ${this.userRole} profile:`, error);
          this.toast.showError('profile.updateError');
        },
      })
    );
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid || !this.currentUser) return;

    const oldPasswordHashed = window.btoa(
      this.passwordForm.get('oldPassword')?.value
    );
    if (oldPasswordHashed !== this.currentUser.password) {
      this.toast.showError('profile.wrongOldPassword');
      this.passwordForm.get('oldPassword')?.setErrors({ incorrect: true });
      return;
    }

    this.isLoading = true;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.subscriptions.push(
      this.homeService
        .updateUserPassword(this.currentUser.id, newPassword)
        .subscribe({
          next: (response: User) => {
            this.isLoading = false;
            if (Array.isArray(response) && response.length > 0) {
              this.currentUser = response[0];
              this.authService.updateCurrentUser(this.currentUser!);
            }
            this.toast.showSuccess('profile.passwordUpdateSuccess');
            this.passwordForm.reset();
          },
          error: (error: Error) => {
            this.isLoading = false;
            console.error(`Error updating ${this.userRole} password:`, error);
            this.toast.showError('profile.passwordUpdateError');
          },
        })
    );
  }

  onCancelEdit() {
    this.populateForm();
    this.isEditingProfile = false;
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;

    if (password !== confirmPassword) {
      form.get('confirmNewPassword')?.setErrors({ mismatch: true });
    } else {
      const errors = form.get('confirmNewPassword')?.errors;
      if (errors?.['mismatch']) {
        delete errors['mismatch'];
        const hasOtherErrors = Object.keys(errors).length > 0;
        form
          .get('confirmNewPassword')
          ?.setErrors(hasOtherErrors ? errors : null);
      }
    }

    return null;
  }

  // ✅ Utility methods
  getPageTitle(): string {
    return `header.${this.userRole}.profile`;
  }

  getRoleBadgeClass(): string {
    const badgeClasses = {
      admin: 'bg-danger',
      client: 'bg-primary',
      customer: 'bg-success',
    };
    return badgeClasses[this.userRole] || 'bg-secondary';
  }

  getRoleDisplayName(): string {
    return `role.${this.userRole}`;
  }

  // ✅ Get current profile image URL
  get currentProfileImage(): string {
    return (
      this.profileForm.get('profileImage')?.value ||
      this.currentUser?.profileImage ||
      ''
    );
  }
}
