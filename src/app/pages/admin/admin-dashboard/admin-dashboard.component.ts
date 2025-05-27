import { Component, inject, model, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTableComponent } from '../../../shared/components/dashboard-table/dashboard-table.component';
import { User } from '../../../models/user.model';
import { Car } from '../../../models/car.model';
import { CarModel } from '../../../models/car-model.model';
import { AdminService } from '../../../core/services/admin/admin.service';
import { Request } from '../../../models/car-request.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { NetworkStatusService } from '../../../core/services/network-status.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    DashboardTableComponent,
    TranslatePipe,
    LoaderComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  activeCard: string = '';
  usersList: User[] = [];
  carList: Car[] = [];
  carModelsList: CarModel[] = [];
  requestsList: Request[] = [];
  userStatusOptions: string[] = ['Approved', 'Rejected', 'Pending'];
  carStatusOptions: string[] = ['Available', 'unavailable'];
  requestAndPaymentStatusOptions: string[] = [
    'Pending',
    'Rejected',
    'Completed',
    'Cancelled',
    'Paid',
    'Failed',
  ];
  isLoading: boolean = false;

  private adminService = inject(AdminService);
  private networkService = inject(NetworkStatusService);
  private toast = inject(ToastService);
  subscriptions: Subscription[] = [];

  // Columns for each table
  userColumns = [
    { field: 'name', header: 'name' },
    { field: 'email', header: 'email' },
    { field: 'role', header: 'role' },
    { field: 'accountStatus', header: 'status' },
  ];

  carColumns = [
    { field: 'brand', header: 'brand' },
    { field: 'modelName', header: 'modelName' },
    { field: 'ownerName', header: 'owner' },
    { field: 'price', header: 'price' },
    { field: 'pricePerDay', header: 'pricePerDay' },
    { field: 'city', header: 'city' },
    { field: 'country', header: 'country' },
    { field: 'isAvailable', header: 'available' },
    { field: 'requestType', header: 'requestType' },
  ];

  carModelColumns = [
    { field: 'name', header: 'modelName' },
    { field: 'brand', header: 'brand' },
  ];

  requestColumns = [
    { field: 'carName', header: 'car' },
    { field: 'customerName', header: 'customer' },
    { field: 'ownerName', header: 'owner' },
    { field: 'requestType', header: 'type' },
    { field: 'requestStatus', header: 'requestStatus' },
    { field: 'paymentStatus', header: 'paymentStatus' },
    { field: 'paymentAmount', header: 'amount' },
    { field: 'startDate', header: 'startDate' },
    { field: 'endDate', header: 'endDate' },
    { field: 'createdAt', header: 'createdAt' },
  ];

  ngOnInit(): void {
    this.loadAllData();
    // Load active card from local storage
    this.getActiveCardFromLocalStorage();
    this.handleNetworkStatus();
  }

  handleNetworkStatus(): void {
    this.subscriptions.push(
      this.networkService.onlineStatus$.subscribe({
        next: (isOnline: boolean) => {
          if (!isOnline) {
            this.isLoading = false;
            const errorTranslationKey = 'toast.error.network';
            this.toast.showError(errorTranslationKey);
          }
        },
      })
    );
  }

  getActiveCardFromLocalStorage(): void {
    const storedCard = localStorage.getItem('activeCard');
    if (storedCard) {
      this.activeCard = storedCard;
    } else {
      this.activeCard = 'users';
      localStorage.setItem('activeCard', this.activeCard);
    }
  }

  loadAllData() {
    this.isLoading = true;
    let usersLoaded = false;
    let carModelsLoaded = false;
    let carsLoaded = false;
    let requestsLoaded = false;

    this.subscriptions.push(
      this.adminService.getAllUsers().subscribe((users) => {
        this.usersList = users.filter((user) => user.role !== 'admin');
        usersLoaded = true;
        checkAllLoaded();
      })
    );

    this.subscriptions.push(
      this.adminService.getCarModels().subscribe((carModels) => {
        this.carModelsList = carModels;
        carModelsLoaded = true;
        checkAllLoaded();
      })
    );

    this.subscriptions.push(
      this.adminService.getAllCars().subscribe((cars) => {
        this.carList = cars.map((car) => ({
          ...car,
          ownerName:
            this.usersList.find((user) => user.id === car.ownerId)?.name ||
            car.ownerId,
          modelName:
            this.carModelsList.find((model) => model.id === car.modelId)
              ?.name || car.modelId,
        }));
        carsLoaded = true;
        checkAllLoaded();
      })
    );

    this.subscriptions.push(
      this.adminService.getAllRequests().subscribe((requests) => {
        this.requestsList = requests.map((req) => {
          const car = this.carList.find((c) => c.id === req.carId);
          return {
            ...req,
            carName: car ? `${car.brand}` : 'Unknown Car',
            customerName:
              this.usersList.find((user) => user.id === req.customerId)?.name ||
              req.customerId,
            ownerName:
              this.usersList.find((user) => user.id === req.ownerId)?.name ||
              req.ownerId,
          };
        });
        requestsLoaded = true;
        checkAllLoaded();
      })
    );

    const checkAllLoaded = () => {
      if (usersLoaded && carModelsLoaded && carsLoaded && requestsLoaded) {
        this.isLoading = false;
      }
    };
  }

  setActiveCard(card: string): void {
    if (this.activeCard === card) {
      this.activeCard = '';
      localStorage.removeItem('activeCard');
    } else {
      this.activeCard = card;
      localStorage.setItem('activeCard', card);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
    // Clear active card from local storage when component is destroyed
    localStorage.removeItem('activeCard');
  }
}
