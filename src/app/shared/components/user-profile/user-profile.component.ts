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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    CommonModule,
    LoaderComponent,
    DatePicker,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private homeService = inject(HomeService);
  private clientService = inject(ClientService);
  private toast = inject(ToastService);
  private activeRoute = inject(ActivatedRoute);

  @Input() userRole: UserRole = 'admin';
  @Input() isAdmin: boolean = false;
  userIdFromRoute: string | null = null;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  currentUser: User | null = null;
  targetUser: User | null = null;
  isEditingOtherUser = false;

  isEditingProfile = false;
  isLoading = false;
  isUploading = false;
  uploadProgress = 0;
  subscriptions: Subscription[] = [];

  constructor() {
    this.currentUser = this.authService.currentUser();
    this.userRole = this.currentUser?.role || 'admin';
    this.initializeForms();
    this.getUserIdFromRoute();
  }

  ngOnInit() {
    // Check if admin is trying to edit another user
    if (
      this.userIdFromRoute &&
      this.isAdmin &&
      this.userIdFromRoute !== this.currentUser?.id
    ) {
      this.isEditingOtherUser = true;
      this.loadUserProfile(this.userIdFromRoute);
    } else {
      // Admin editing their own profile or regular user
      this.isEditingOtherUser = false;
      this.targetUser = this.currentUser;
      this.loadUserProfile();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  getUserIdFromRoute(): string | null {
    this.userIdFromRoute = this.activeRoute.snapshot.paramMap.get('id');
    return this.userIdFromRoute;
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

  private loadUserProfile(userId?: string) {
    this.isLoading = true;

    if (!this.currentUser) {
      this.isLoading = false;
      this.toast.showError('profile.noUser');
      return;
    }

    // If admin is editing another user
    if (userId && this.isAdmin && userId !== this.currentUser.id) {
      this.subscriptions.push(
        this.homeService.getUserById(userId).subscribe({
          next: (profile: User) => {
            this.isLoading = false;
            if (profile) {
              this.targetUser = profile; // Set the target user being edited
              this.passwordForm.get('oldPassword')?.clearValidators();
              this.passwordForm.get('oldPassword')?.updateValueAndValidity();
              this.populateForm();
            }
          },
          error: (error: Error) => {
            this.isLoading = false;
            console.error('Error loading user profile by ID:', error);
            this.toast.showError('profile.loadError');
          },
        })
      );
    } else {
      // Loading current user's own profile
      this.subscriptions.push(
        this.homeService.getUserById(this.currentUser.id).subscribe({
          next: (profile: User) => {
            this.isLoading = false;
            if (profile) {
              this.targetUser = profile;
              this.populateForm();
            }
          },
          error: (error: Error) => {
            this.isLoading = false;
            console.error('Error loading profile:', error);
            this.toast.showError('profile.loadError');
          },
        })
      );
    }
  }

  passwordMatchValidator(form: FormGroup): void {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmNewPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmNewPassword')?.setErrors(null);
    }
  }

  private populateForm() {
    if (!this.targetUser) return;

    this.profileForm.patchValue({
      name: this.targetUser.name || '',
      email: this.targetUser.email || '',
      phone: this.targetUser.phone || '',
      address: this.targetUser.address || '',
      dateOfBirth: this.targetUser.dateOfBirth || '',
      profileImage: this.targetUser.profileImage || '',
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
    if (!this.targetUser) return;

    this.profileForm.patchValue({
      profileImage: '',
    });

    this.targetUser.profileImage = '';

    // Only update auth service if editing own profile
    if (!this.isEditingOtherUser) {
      this.authService.updateCurrentUser(this.targetUser);
    }

    this.isEditingProfile = true;
    this.toast.showSuccess('profile.imageRemoved');
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || !this.targetUser) return;

    // Security check: Only admin can edit other users
    if (this.isEditingOtherUser && !this.isAdmin) {
      this.toast.showError('profile.unauthorizedEdit');
      return;
    }

    this.isLoading = true;
    const updatedUser = { ...this.targetUser, ...this.profileForm.value };

    this.subscriptions.push(
      this.homeService.updateUserProfile(updatedUser).subscribe({
        next: (response: User) => {
          this.isLoading = false;
          const updatedUserData = Array.isArray(response)
            ? response[0]
            : response;

          // Update the target user
          this.targetUser = updatedUserData;

          // If admin updated their own profile, update the auth service
          if (
            !this.isEditingOtherUser ||
            this.targetUser?.id === this.currentUser?.id
          ) {
            this.authService.updateCurrentUser(updatedUserData);
          }

          this.toast.showSuccess(
            this.isEditingOtherUser
              ? 'profile.userUpdateSuccess'
              : 'profile.updateSuccess'
          );
          this.isEditingProfile = false;
        },
        error: (error: Error) => {
          this.isLoading = false;
          console.error('Error updating profile:', error);
          this.toast.showError('profile.updateError');
        },
      })
    );
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid || !this.targetUser) return;

    // Security: Only allow password change for own account or if admin is changing another user's password
    if (this.isEditingOtherUser && !this.isAdmin) {
      this.toast.showError('profile.unauthorizedPasswordChange');
      return;
    }

    // For admin changing another user's password, they might not need to provide old password
    if (this.isEditingOtherUser && this.isAdmin) {
      this.updatePasswordAsAdmin();
      return;
    }

    // Regular password update (user updating their own password)
    const oldPasswordHashed = window.btoa(
      this.passwordForm.get('oldPassword')?.value
    );
    if (oldPasswordHashed !== this.targetUser.password) {
      this.toast.showError('profile.wrongOldPassword');
      this.passwordForm.get('oldPassword')?.setErrors({ incorrect: true });
      return;
    }

    this.isLoading = true;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.subscriptions.push(
      this.homeService
        .updateUserPassword(this.targetUser.id, newPassword)
        .subscribe({
          next: (response: User) => {
            this.isLoading = false;
            const updatedUserData = Array.isArray(response)
              ? response[0]
              : response;

            this.targetUser = updatedUserData;

            // Update auth service if updating own password
            if (!this.isEditingOtherUser) {
              this.authService.updateCurrentUser(updatedUserData);
            }

            this.toast.showSuccess('profile.passwordUpdateSuccess');
            this.passwordForm.reset();
          },
          error: (error: Error) => {
            this.isLoading = false;
            console.error('Error updating password:', error);
            this.toast.showError('profile.passwordUpdateError');
          },
        })
    );
  }

  private updatePasswordAsAdmin() {
    if (!this.isAdmin || !this.targetUser) return;

    this.isLoading = true;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.subscriptions.push(
      this.homeService
        .updateUserPassword(this.targetUser.id, newPassword)
        .subscribe({
          next: (response: User) => {
            this.isLoading = false;
            this.targetUser = Array.isArray(response) ? response[0] : response;
            this.toast.showSuccess('profile.adminPasswordUpdateSuccess');
            this.passwordForm.reset();
          },
          error: (error: Error) => {
            this.isLoading = false;
            console.error('Admin password update error:', error);
            this.toast.showError('profile.passwordUpdateError');
          },
        })
    );
  }
  onCancelEdit() {
    this.populateForm();
    this.isEditingProfile = false;
  }

  // Updated utility methods
  getPageTitle(): string {
    if (this.isEditingOtherUser) {
      return 'header.admin.editUser';
    }
    return `header.${this.userRole}.profile`;
  }

  getRoleBadgeClass(): string {
    const targetRole = this.targetUser?.role || this.userRole;
    const badgeClasses = {
      admin: 'bg-danger',
      client: 'bg-primary',
      customer: 'bg-success',
    };
    return badgeClasses[targetRole] || 'bg-secondary';
  }

  getRoleDisplayName(): string {
    const targetRole = this.targetUser?.role || this.userRole;
    return `role.${targetRole}`;
  }

  // ✅ Get current profile image URL
  get currentProfileImage(): string {
    return (
      this.profileForm.get('profileImage')?.value ||
      this.targetUser?.profileImage ||
      ''
    );
  }

  // Helper method to check if current user can edit the target user
  canEditUser(): boolean {
    if (!this.targetUser || !this.currentUser) return false;

    // Users can always edit their own profile
    if (this.targetUser.id === this.currentUser.id) return true;

    // Only admins can edit other users
    return this.isAdmin;
  }

  // Get the display name for the user being edited
  getTargetUserName(): string {
    return this.targetUser?.name || 'Unknown User';
  }
}
