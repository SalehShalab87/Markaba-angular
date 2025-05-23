import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { Car } from '../../../models/car.model';
import { CarModel } from '../../../models/car-model.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  
  getAllUsers():Observable<User[]>{
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getAllCars():Observable<Car[]>{
    return this.http.get<Car[]>(`${this.apiUrl}/cars`);
  }

  getCarModels():Observable<CarModel[]>{
    return this.http.get<CarModel[]>(`${this.apiUrl}/carModels`);
  }

  


}
