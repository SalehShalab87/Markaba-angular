import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private redirectUrl: string = '';
  apiUrl: string = 'http://localhost:3000/users';

  private isLoggedIn$ = new BehaviorSubject<boolean>(false);
  public isLoggedInObservable = this.isLoggedIn$.asObservable();

  private http = inject(HttpClient);

  IsUserExist(email: string, password: string): Observable<User[]> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);
    return this.http.get<User[]>(this.apiUrl, { params });
  }
}
