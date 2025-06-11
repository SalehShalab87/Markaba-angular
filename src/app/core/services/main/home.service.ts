import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Car } from '../../../models/car.model';
import { User } from '../../../models/user.model';
import { Request } from '../../../models/car-request.model';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getFeaturedCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars`).pipe(
      // get First 6 cars
      map((cars) => cars.slice(0, 3))
    );
  }

  getAllCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars`);
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/cars/${id}`);
  }

  getUserById(ownerId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${ownerId}`);
  }

  // Updated method to exclude cancelled and rejected requests
  checkUserRequestForCar(
    carId: string,
    customerId: string
  ): Observable<boolean> {
    return this.http
      .get<Request[]>(
        `${this.apiUrl}/requests?carId=${carId}&customerId=${customerId}`
      )
      .pipe(
        map((requests) =>
          requests.some(
            (request) =>
              request.requestStatus === 'pending' ||
              request.requestStatus === 'accepted' ||
              request.requestStatus === 'completed'
          )
        )
      );
  }
  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user);
  }
  updateUserPassword(userId: string, newPassword: string): Observable<User> {
    const passwordHash = window.btoa(newPassword);
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, {
      password: passwordHash,
    });
  }
}
