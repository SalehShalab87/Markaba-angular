import { Component, inject, OnInit } from '@angular/core';
import { Request } from '../../../models/car-request.model';
import { AuthService } from '../../../core/services/auth/auth.service';
import { AdminService } from '../../../core/services/admin/admin.service';
import { TableColumn, DashboardTableComponent } from '../../../shared/components/dashboard-table/dashboard-table.component';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { User } from '../../../models/user.model';
import { Car } from '../../../models/car.model';
import { RequestService } from '../../../core/services/main/request.service';

@Component({
  selector: 'app-customer-requests',
  imports: [LoaderComponent, DashboardTableComponent],
  templateUrl: './customer-requests.component.html',
  styleUrl: './customer-requests.component.scss',
})
export class CustomerRequestsComponent implements OnInit {
  private requestService = inject(RequestService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  
  isLoading: boolean = false;
  requestList: Request[] = [];
  customerId: string = this.authService.currentUser()?.id || '';
  
  usersList: User[] = [];
  carList: Car[] = [];
  
  requestColumns: TableColumn[] = [
    { field: 'carName', header: 'car' },
    { field: 'ownerName', header: 'owner' },
    { field: 'startDate', header: 'startDate' },
    { field: 'endDate', header: 'endDate' },
    { field: 'requestType', header: 'type' },
    { field: 'requestStatus', header: 'requestStatus' },
    { field: 'paymentStatus', header: 'paymentStatus' },
    { field: 'paymentAmount', header: 'amount' },
    { field: 'createdAt', header: 'createdAt' },
  ];
  
  requestAndPaymentStatusOptions: string[] = [
    'pending',
    'accepted', 
    'rejected',
    'completed',
    'cancelled',
    'paid',
    'failed',
  ];

  ngOnInit() {
    this.loadAllData();
  }

  private loadAllData() {
    this.isLoading = true;
    let loadedCount = 0;
    const totalLoads = 3;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalLoads) {
        this.mapRequestData();
        this.isLoading = false;
      }
    };

    // Load users
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.usersList = users;
        checkComplete();
      },
      error: () => checkComplete()
    });

    // Load cars
    this.adminService.getAllCars().subscribe({
      next: (cars) => {
        this.carList = cars;
        checkComplete();
      },
      error: () => checkComplete()
    });

    // Load requests
    this.requestService.getRequestsByCustomer(this.customerId).subscribe({
      next: (requests) => {
        this.requestList = requests;
        checkComplete();
      },
      error: () => {
        this.requestList = [];
        checkComplete();
      }
    });
  }

  private mapRequestData() {
    // Same mapping logic as admin dashboard
    this.requestList = this.requestList.map((req) => {
      const car = this.carList.find((c) => c.id === req.carId);
      return {
        ...req,
        carName: car ? `${car.brand} ${car.name}` : 'Unknown Car',
        ownerName: this.usersList.find((user) => user.id === req.ownerId)?.name || req.ownerId,
      };
    });
  }
}
