import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../../models/user.model';
import { Car } from '../../../models/car.model';
import { CarModel } from '../../../models/car-model.model';
import { Request } from '../../../models/car-request.model';

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

  getAllRequests(): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/requests`);
  }

  getAllClients(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?role=client`);
  }

  markClientAsApproved(client: User): Observable<User[]> {
    return this.http.put<User[]>(`${this.apiUrl}/users/${client.id}`, { ...client, accountStatus: 'approved' });
  }

  markClientAsRejected(client: User): Observable<User[]> {
    return this.http.put<User[]>(`${this.apiUrl}/users/${client.id}`, { ...client, accountStatus: 'rejected' });
  }

  addNewCarModel(carModel: CarModel): Observable<CarModel[]> {
    return this.http.post<CarModel[]>(`${this.apiUrl}/carModels`, carModel);
  }

  deleteCarModel(carModelId: string): Observable<{}> {
    return this.http.delete(`${this.apiUrl}/carModels/${carModelId}`);
  }

  updateCarModel(carModel: CarModel): Observable<CarModel[]> {
    return this.http.put<CarModel[]>(`${this.apiUrl}/carModels/${carModel.id}`, carModel);
  }


}
