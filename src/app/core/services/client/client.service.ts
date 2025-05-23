import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { addCarsUrl, admin, CarModelsUrl, client, cloudinaryUrl, cloudName, folderName, uploadPreset } from '../../../shared/constant/constant';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CarModel } from '../../../models/car-model.model';
import { Car } from '../../../models/car.model';


@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private carsRequest = signal<Request[]>([]);
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  isLoggedIn: boolean = this.auth.isLoggedIn();
  role: string | null = this.auth.userRole();



  getCarModels() : Observable  <CarModel[]>{
    return this.http.get<CarModel[]>(CarModelsUrl)
  }

  addNewCar(carInfo: Car): Observable<Car> {
    if (this.isLoggedIn && (this.role === client || this.role === admin)) {
      return this.http.post<Car>(addCarsUrl, carInfo);
    }
    return throwError(
      () => new Error('must be loggedIn or to be a client add a car')
    );
  }

    uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName)
     formData.append('folder', folderName);

    return this.http.post(cloudinaryUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
