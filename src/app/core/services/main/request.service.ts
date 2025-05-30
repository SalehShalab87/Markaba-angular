import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Request } from '../../../models/car-request.model';


@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000';

  createRequest(requestData: Request): Observable<Request> {
    return this.http.post<Request>(`${this.apiUrl}/requests`, requestData);
  }

  getRequestsByCustomer(customerId: string): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/requests?customerId=${customerId}`);
  }

  getRequestsByOwner(ownerId: string): Observable<Request[]> {
    return this.http.get<Request[]>(`${this.apiUrl}/requests?ownerId=${ownerId}`);
  }

  updateRequestStatus(requestId: string, status: string): Observable<Request> {
    return this.http.patch<Request>(`${this.apiUrl}/requests/${requestId}`, {
      requestStatus: status,
    });
  }
}
