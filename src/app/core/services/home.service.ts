import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Car } from '../../models/car.model';
import { CarModel } from '../../models/car-model.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  getFeaturedCars():Observable<Car[]>{
    return this.http.get<Car[]>(`${this.apiUrl}/cars`).pipe(
      // get First 6 cars
      map(cars => cars.slice(0, 3))
    );
  }

  getAllCars(): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/cars`)
  }

}
