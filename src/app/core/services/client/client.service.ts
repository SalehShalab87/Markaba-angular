import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { admin, CarModelsUrl, CarsUrl, client, cloudinaryUrl, cloudName, folderName, uploadPreset } from '../../../shared/constant/constant';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarModel } from '../../../models/car-model.model';
import { Car } from '../../../models/car.model';
import { User } from '../../../models/user.model';
import { Request as CarRequest } from '../../../models/car-request.model';


@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  isLoggedIn: boolean = this.auth.isLoggedIn();
  role: string | null = this.auth.userRole();
  apiUrl: string = 'http://localhost:3000';

  getCarModels(): Observable<CarModel[]> {
    return this.http.get<CarModel[]>(CarModelsUrl);
  }

  addNewCar(carInfo: Car): Observable<Car> {
    if (this.isLoggedIn && (this.role === client || this.role === admin)) {
      return this.http.post<Car>(CarsUrl, carInfo);
    }
    return throwError(
      () => new Error('must be loggedIn or to be a client add a car')
    );
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    formData.append('folder', folderName);

    return this.http.post(cloudinaryUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  getClientCars(): Observable<Car[]> {
    if (this.isLoggedIn && this.role === client) {
      const userId = this.auth.currentUser()?.id;
      return this.http.get<Car[]>(`${CarsUrl}?ownerId=${userId}`);
    }
    return throwError(
      () => new Error('must be loggedIn or to be a client to get cars')
    );
  }
  deleteCar(carId: string): Observable<void> {
    if (this.isLoggedIn && this.role === client) {
      return this.http.delete<void>(`${CarsUrl}/${carId}`);
    }
    return throwError(
      () => new Error('must be loggedIn or to be a client to delete a car')
    );
  }

  getAllRequests(): Observable<CarRequest[]> {
    return this.http.get<CarRequest[]>(`${this.apiUrl}/requests`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateRequestStatus(
    requestId: string,
    status: string
  ): Observable<CarRequest> {
    return this.http.patch<CarRequest>(`${this.apiUrl}/requests/${requestId}`, {
      requestStatus: status,
      paymentStatus: 'paid',
    });
  }

  acceptRequestAndUpdateCar(
    requestId: string,
    carId: string
  ): Observable<{ request: CarRequest; car: Car }> {
    if (this.isLoggedIn && this.role === client) {
      return this.http.post<{ request: CarRequest; car: Car }>(
        `${this.apiUrl}/requests/${requestId}/accept`,
        {
          carId: carId,
        }
      );
    }
    return throwError(
      () => new Error('must be loggedIn and be a client to accept requests')
    );
  }

  updateCarAvailability(carId: string, isAvailable: boolean): Observable<Car> {
    const isAvailableValue = isAvailable ? 'available' : 'unavailable';
    if (this.isLoggedIn && this.role === client) {
      return this.http.patch<Car>(`${CarsUrl}/${carId}`, {
        isAvailable: isAvailableValue,
      });
    }
    return throwError(
      () =>
        new Error('must be loggedIn and be a client to update car availability')
    );
  }
  updateCar(carId: string, carData: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/cars/${carId}`, carData);
  }

  getCarById(carId: string): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/cars/${carId}`);
  }
}
