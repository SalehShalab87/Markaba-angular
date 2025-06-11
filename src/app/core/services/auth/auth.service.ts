import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal } from '@angular/core';
import { User, UserRole } from '../../../models/user.model';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { ToastService } from '../main/toast.service';
import { FormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl+'/users';
  private redirectUrl = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  // Signal to hold the current user
  private _currentUser = signal<User | null>(null);

  constructor() {
    this.loadUserFromLocalStorage();
  }

  // Signals to hold the current user state
  readonly currentUser: Signal<User | null> = computed(() =>
    this._currentUser()
  );
  readonly isLoggedIn: Signal<boolean> = computed(
    () => this._currentUser() !== null
  );
  readonly userRole: Signal<UserRole | null> = computed(
    () => this._currentUser()?.role || null
  );

  loadUserFromLocalStorage(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this._currentUser.set(JSON.parse(user));
    }
  }

  isUserExists(email: string, password: string): Observable<User[]> {
    const passwordHash = window.btoa(password);
    return this.http.get<User[]>(
      `${this.apiUrl}?email=${email}&password=${passwordHash}`
    );
  }

  isUserEmailExists(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`);
  }

  registerUser(user: User): Observable<User> {
    const passwordHash = window.btoa(user.password);
    user.password = passwordHash;

    if (user.role === 'client') {
      user.accountStatus = 'pending';
    } else {
      user.accountStatus = 'approved';
    }

    return this.http.post<User>(this.apiUrl, user);
  }

  redirectUserByRole(): void {
    const userRole = this._currentUser()?.role;
    switch (userRole) {
      case 'admin':
        this.router.navigateByUrl('/admin');
        break;
      case 'client':
        if (this._currentUser()?.accountStatus === 'pending') {
          this.toast.showWarn('Your account is pending approval.');
          this.router.navigateByUrl('/login');
          return;
        }
        this.router.navigateByUrl('/client');
        break;
      case 'customer':
        this.router.navigateByUrl('/customer');
        break;
      default:
        this.router.navigateByUrl('/');
    }
  }

  login(user: User): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    this._currentUser.set(userWithoutPassword as User);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    const redirectUrl = this.getRedirectUrl();
    if (redirectUrl) {
      this.router.navigateByUrl(redirectUrl);
      this.setRedirectUrl('');
    } else {
      this.redirectUserByRole();
    }
  }

  logout(): void {
    this._currentUser.set(null);
    this.setRedirectUrl('');
    localStorage.clear();
    const successTranslationKey = 'toast.success.logout';
    this.toast.showSuccess(successTranslationKey);
    this.router.navigateByUrl('/');
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string {
    return this.redirectUrl;
  }

  passwordMatchValidator(form: FormGroup): void {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      form.get('confirmPassword')?.setErrors(null);
    }
  }

  updateCurrentUser(user: User): void {
    this._currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUserProfile(): Observable<User> {
    const currentUser = this.currentUser();
    if (currentUser) {
      return this.http.get<User>(`${this.apiUrl}/${currentUser.id}`);
    }
    return throwError(() => new Error('No current user'));
  }

  updateUserProfile(user: User): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${user.id}`, user);
  }

  updateUserPassword(userId: string, newPassword: string): Observable<User> {
    const hashedPassword = window.btoa(newPassword);
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, {
      password: hashedPassword,
    });
  }
}
