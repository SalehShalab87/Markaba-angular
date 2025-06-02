import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardTableComponent } from '../../../shared/components/dashboard-table/dashboard-table.component';
import { User } from '../../../models/user.model';
import { Car } from '../../../models/car.model';
import { CarModel } from '../../../models/car-model.model';
import { AdminService } from '../../../core/services/admin/admin.service';
import { Request, RequestStatus } from '../../../models/car-request.model';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ToastService } from '../../../core/services/main/toast.service';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { I18nService } from '../../../core/services/i18n/i18n.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    DashboardTableComponent,
    TranslatePipe,
    LoaderComponent,
    ConfirmDialog,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  providers: [ConfirmationService],
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
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private i18n = inject(I18nService);
  private router = inject(Router);
  auth = inject(AuthService);
  subscriptions: Subscription[] = [];

  // Columns for each table
  userColumns = [
    { field: 'name', header: 'name' },
    { field: 'email', header: 'email' },
    { field: 'role', header: 'role' },
    { field: 'accountStatus', header: 'status' },
    { field: 'actions', header: 'actions' },
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
    { field: 'actions', header: 'actions' },
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
    { field: 'actions', header: 'actions' },
  ];

  ngOnInit(): void {
    this.loadAllData();
    // Load active card from local storage
    this.getActiveCardFromLocalStorage();
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
  }

  // Delete Methods with PrimeNG Confirmation
  onDeleteCar(car: Car): void {
    const translateHeader = this.i18n.translate(
      'dialog.deleteConfirmationHeader'
    );
    const translatedMessage = this.i18n.translate(
      'dialog.deleteCarConfirmation'
    );

    this.confirmationService.confirm({
      message: `${translatedMessage} "${car.brand}"?`,
      header: translateHeader,
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      acceptLabel: this.i18n.translate('dialog.yes'),
      rejectLabel: this.i18n.translate('dialog.no'),
      acceptButtonStyleClass: 'p-button-danger my-2 me-1',
      rejectButtonStyleClass: 'p-button-secondary my-2 ms-1',
      accept: () => {
        this.deleteCar(car);
      },
      reject: () => {
      },
    });
  }

  onDeleteRequest(request: Request): void {
    const translateHeader = this.i18n.translate(
      'dialog.deleteConfirmationHeader'
    );
    const translatedMessage = this.i18n.translate(
      'dialog.deleteRequestConfirmation'
    );

    this.confirmationService.confirm({
      message: `${translatedMessage} #${request.id.substring(0, 8)}?`,
      header: translateHeader,
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      acceptLabel: this.i18n.translate('dialog.yes'),
      rejectLabel: this.i18n.translate('dialog.no'),
      acceptButtonStyleClass: 'p-button-danger my-2 me-1',
      rejectButtonStyleClass: 'p-button-secondary my-2 ms-1',
      accept: () => {
        this.deleteRequest(request);
      },
      reject: () => {
      },
    });
  }

  onDeleteUser(user: User): void {
    const translateHeader = this.i18n.translate(
      'dialog.deleteConfirmationHeader'
    );
    const translatedMessage = this.i18n.translate(
      'dialog.deleteUserConfirmation'
    );

    this.confirmationService.confirm({
      message: `${translatedMessage} "${user.name}"?`,
      header: translateHeader,
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      acceptLabel: this.i18n.translate('dialog.yes'),
      rejectLabel: this.i18n.translate('dialog.no'),
      acceptButtonStyleClass: 'p-button-danger my-2 me-1',
      rejectButtonStyleClass: 'p-button-secondary my-2 ms-1',
      accept: () => {
        this.deleteUser(user);
      },
      reject: () => {},
    });
  }
  onCancelRequest(request: Request): void {
    const translateHeader = this.i18n.translate(
      'dialog.cancelRequestConfirmationHeader'
    );
    const translatedMessage = this.i18n.translate(
      'dialog.cancelRequestConfirmation'
    );
    this.confirmationService.confirm({
      message: `${translatedMessage} #${request.id.substring(0, 8)}?`,
      header: translateHeader,
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      acceptLabel: this.i18n.translate('dialog.yes'),
      rejectLabel: this.i18n.translate('dialog.no'),
      acceptButtonStyleClass: 'p-button-danger my-2 me-1',
      rejectButtonStyleClass: 'p-button-secondary my-2 ms-1',
      accept: () => {
        this.updateRequestStatus(request.id, 'cancelled');
      },
      reject: () => {
      },
    });
  }
  private updateRequestStatus(requestId:string, status:RequestStatus){
    this.isLoading = true;
    this.subscriptions.push(
      this.adminService.updateRequestStatus(requestId, status).subscribe({
        next: (updatedRequest) => {
          const index = this.requestsList.findIndex(
            (r) => r.id === updatedRequest.id
          );
          if (index !== -1) {
            this.requestsList[index] = updatedRequest;
          }
          this.toastService.showSuccess(
            this.i18n.translate('messages.requestStatusUpdatedSuccess')
          );
          this.loadAllData(); 
          this.isLoading = false;
        },
        error: (error) => {
          this.toastService.showError(
            this.i18n.translate('messages.requestStatusUpdateError')
          );
          this.isLoading = false;
          console.error('Update request status error:', error);
        },
      })
    );
  }

  private deleteUser(user: User): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.usersList = this.usersList.filter((u) => u.id !== user.id);
          this.toastService.showSuccess(
            this.i18n.translate('messages.userDeletedSuccess')
          );
          this.isLoading = false;
        },
        error: (error: Error) => {
          this.toastService.showError(
            this.i18n.translate('messages.userDeleteError')
          );
          this.isLoading = false;
          console.error('Delete user error:', error);
        },
      })
    );
  }

  private deleteCar(car: Car): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.adminService.deleteCar(car.id).subscribe({
        next: () => {
          this.carList = this.carList.filter((c) => c.id !== car.id);
          this.toastService.showSuccess(
            this.i18n.translate('messages.carDeletedSuccess')
          );
          this.loadAllData(); 
          this.isLoading = false;
        },
        error: () => {
          this.toastService.showError(
            this.i18n.translate('messages.carDeleteError')
          );
          this.isLoading = false;
        },
      })
    );
  }

  private deleteRequest(request: Request): void {
    this.isLoading = true;
    this.subscriptions.push(
      this.adminService.deleteRequest(request.id).subscribe({
        next: () => {
          this.requestsList = this.requestsList.filter(
            (r) => r.id !== request.id
          );
          this.toastService.showSuccess(
            this.i18n.translate('messages.requestDeletedSuccess')
          );
          this.loadAllData();
          this.isLoading = false;
        },
        error: () => {
          this.toastService.showError(
            this.i18n.translate('messages.requestDeleteError')
          );
          this.isLoading = false;
        },
      })
    );
  }

  onDelete(item: any): void {
    switch (this.activeCard) {
      case 'users':
        this.onDeleteUser(item);
        break;
      case 'cars':
        this.onDeleteCar(item);
        break;
      case 'requests':
        this.onDeleteRequest(item);
        break;
    }
  }
  onEdit(item: any) {
    switch (this.activeCard) {
      case 'cars':
        this.router.navigateByUrl(`/admin/edit-car/${item.id}`);
        break;
      case 'users':
        this.router.navigateByUrl(`/admin/edit-profile/${item.id}`);
        break;
    }
  }
}
