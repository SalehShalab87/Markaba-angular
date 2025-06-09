import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../../../core/services/auth/auth.service";
import { ClientService } from "../../../core/services/client/client.service";
import { CarModel } from "../../../models/car-model.model";
import { Request as CarRequest, PaymentStatus, RequestStatus } from "../../../models/car-request.model";
import { Car } from "../../../models/car.model";
import { User } from "../../../models/user.model";
import { DashboardTableComponent } from "../../../shared/components/dashboard-table/dashboard-table.component";
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { TranslatePipe } from "../../../shared/pipes/translate.pipe";



@Component({
  selector: 'app-client-dashboard',
  imports: [
    CommonModule,
    DashboardTableComponent,
    TranslatePipe,
    LoaderComponent,
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  private clientService = inject(ClientService);
  private authService = inject(AuthService);

  activeCard = '';
  currentClient: User | null = this.authService.currentUser();

  // Data arrays
  carList: Car[] = [];
  carModels: CarModel[] = []; // Added CarModel array
  incomingRequestsList: CarRequest[] = [];
  paymentsList: CarRequest[] = [];
  allUsers: User[] = [];

  // Status options (matching your model exactly)
  requestStatusOptions: RequestStatus[] = [
    'pending',    
    'accepted',  
    'rejected',
    'completed',
    'cancelled',
  ];

  paymentStatusOptions: PaymentStatus[] = [
    'pending',
    'paid',
    'failed',
  ];

  carStatusOptions: string[] = [
    'available',
    'unavailable',
  ]

  isLoading = false;
  subscriptions: Subscription[] = [];

  // Earnings calculation
  totalEarnings = 0;

  // Table columns (fixed according to your Car model)
  carsColumns = [
    { field: 'brand', header: 'brand' },
    { field: 'modelName', header: 'model' }, // Will be populated from CarModel
    { field: 'requestType', header: 'type' },
    { field: 'price', header: 'price' },
    { field: 'pricePerDay', header: 'pricePerDay' },
    { field: 'city', header: 'location' },
    { field: 'isAvailable', header: 'status' },
  ];

  requestsColumns = [
    { field: 'customerName', header: 'customer' },
    { field: 'carName', header: 'car' },
    { field: 'requestType', header: 'type' },
    { field: 'requestStatus', header: 'status' },
    { field: 'paymentAmount', header: 'amount' },
    { field: 'startDate', header: 'startDate' },
    { field: 'endDate', header: 'endDate' },
    { field: 'actions', header: 'actions' },
  ];

  paymentsColumns = [
    { field: 'customerName', header: 'customer' },
    { field: 'carName', header: 'car' },
    { field: 'requestType', header: 'type' },
    { field: 'requestStatus', header: 'status' }, // Show request status instead of payment status
    { field: 'paymentAmount', header: 'amount' },
    { field: 'createdAt', header: 'createdAt' },
  ];

  // ✅ Add statusFields for each table type
  carsStatusFields = ['isAvailable']; // For filtering car availability
  requestsStatusFields = ['requestStatus']; // For filtering request status  
  paymentsStatusFields = ['requestStatus']; // For filtering payment/earnings status

  ngOnInit(): void {
    this.loadAllData();
    this.getActiveCardFromLocalStorage();
  }

  getActiveCardFromLocalStorage(): void {
    const storedCard = localStorage.getItem('clientActiveCard');
    if (storedCard && ['cars', 'requests', 'payments'].includes(storedCard)) {
      this.activeCard = storedCard;
    } else {
      this.activeCard = 'cars';
      localStorage.setItem('clientActiveCard', this.activeCard);
    }
  }

  loadAllData() {
    if (!this.currentClient?.id) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    // Load car models first
    this.subscriptions.push(
      this.clientService.getCarModels().subscribe({
        next: (models) => {
          this.carModels = models || [];
          this.loadCars();
        },
        error: () => {
          this.carModels = [];
          this.loadCars(); // Continue even if models fail
        },
      })
    );
  }

  loadCars() {
    // Load my cars
    this.subscriptions.push(
      this.clientService.getClientCars().subscribe({
        next: (cars) => {
          this.carList = cars || [];
          // Enhance cars with model names
          this.carList = this.carList.map((car) => {
            const model = this.carModels.find((m) => m.id === car.modelId);
            return {
              ...car,
              modelName: model?.name || 'Unknown Model',
            };
          });
          this.loadUsersAndRequests();
        },
        error: () => {
          this.carList = [];
          this.isLoading = false;
        },
      })
    );
  }

  loadUsersAndRequests() {
    let usersLoaded = false;
    let requestsLoaded = false;

    // Load all users for customer names
    this.subscriptions.push(
      this.clientService.getAllUsers().subscribe({
        next: (users) => {
          this.allUsers = users || [];
          console.log('Loaded users:', this.allUsers.length);
          usersLoaded = true;
          if (requestsLoaded) this.processRequestsData();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.allUsers = [];
          usersLoaded = true;
          if (requestsLoaded) this.processRequestsData();
        },
      })
    );

    // Load all requests
    this.subscriptions.push(
      this.clientService.getAllRequests().subscribe({
        next: (allRequests) => {
          // Get my car IDs
          const myCarIds = this.carList.map((car) => car.id);

          // Filter requests for my cars only (where I'm the owner)
          const requestsForMyCars = allRequests.filter(
            (req: CarRequest) =>
              myCarIds.includes(req.carId) &&
              req.ownerId === this.currentClient?.id
          );

          this.incomingRequestsList = requestsForMyCars;
          requestsLoaded = true;
          if (usersLoaded) this.processRequestsData();
        },
        error: () => {
          this.incomingRequestsList = [];
          requestsLoaded = true;
          if (usersLoaded) this.processRequestsData();
        },
      })
    );
  }

  processRequestsData() {
    // Map requests with customer and car names
    this.incomingRequestsList = this.incomingRequestsList.map((req) => {
      const car = this.carList.find((c) => c.id === req.carId);
      const customer = this.allUsers.find((u) => u.id === req.customerId);
      const model = this.carModels.find((m) => m.id === car?.modelId);

      return {
        ...req,
        carName: car
          ? `${car.brand} ${model?.name || car.name || 'Unknown Model'}`
          : 'Unknown Car',
        customerName: customer?.name || 'Unknown Customer',
      };
    });

    // ✅ Simple logic: accepted and completed requests are "earnings"
    this.paymentsList = this.incomingRequestsList.filter(
      (req) =>
        req.requestStatus === 'accepted' || req.requestStatus === 'completed'
    );

    this.calculateEarnings();
    this.isLoading = false;

    console.log('Request status breakdown:', {
      pending: this.incomingRequestsList.filter(
        (r) => r.requestStatus === 'pending'
      ).length,
      accepted: this.incomingRequestsList.filter(
        (r) => r.requestStatus === 'accepted'
      ).length,
      completed: this.incomingRequestsList.filter(
        (r) => r.requestStatus === 'completed'
      ).length,
      rejected: this.incomingRequestsList.filter(
        (r) => r.requestStatus === 'rejected'
      ).length,
      totalEarnings: this.totalEarnings,
    });
  }

  // ✅ Calculate earnings from accepted and completed requests
  calculateEarnings() {
    this.totalEarnings = this.paymentsList.reduce((total, req) => {
      const amount =
        req.paymentAmount && typeof req.paymentAmount === 'number'
          ? req.paymentAmount
          : 0;
      return total + amount;
    }, 0);

    console.log(
      `Total earnings: ${this.totalEarnings} JOD from ${this.paymentsList.length} requests`
    );
  }

  setActiveCard(card: string): void {
    if (this.activeCard === card) {
      this.activeCard = '';
      localStorage.removeItem('clientActiveCard');
    } else {
      this.activeCard = card;
      localStorage.setItem('clientActiveCard', card);
    }
  }

  // Handle incoming request actions (using correct status values)
  onAcceptRequest(request: CarRequest | User) {
    if (!request.id) {
      console.error('Request ID is missing');
      return;
    }

    // ✅ Update request status first
    this.clientService.updateRequestStatus(request.id, 'accepted').subscribe({
      next: (response) => {
        console.log('Request accepted successfully:', response);

        // ✅ Update local request state
        const requestIndex = this.incomingRequestsList.findIndex(
          (r) => r.id === request.id
        );
        if (requestIndex !== -1) {
          this.incomingRequestsList[requestIndex].requestStatus = 'accepted';
        }

        // ✅ NOW update car availability on backend
        this.clientService.updateCarAvailability((request as CarRequest).carId, false).subscribe({
          next: (carResponse) => {
            console.log('Car availability updated successfully:', carResponse);
            
            // ✅ Update local car state
            const carIndex = this.carList.findIndex((c) => c.id === (request as CarRequest).carId);
            if (carIndex !== -1) {
              this.carList[carIndex].isAvailable = 'unavailable';
            }
          },
          error: (carError) => {
            console.error('Error updating car availability:', carError);
          }
        });

        // ✅ Recalculate earnings (accepted requests now count)
        this.paymentsList = this.incomingRequestsList.filter(
          (req) =>
            req.requestStatus === 'accepted' ||
            req.requestStatus === 'completed'
        );
        this.calculateEarnings();
      },
      error: (error) => {
        console.error('Error accepting request:', error);
      },
    });
  }

  onRejectRequest(request: CarRequest|User) {
    if (!request.id) {
      console.error('Request ID is missing');
      return;
    }

    // ✅ Simple reject - just update request status
    this.clientService.updateRequestStatus(request.id, 'rejected').subscribe({
      next: (response) => {
        console.log('Request rejected successfully:', response);

        // ✅ Update local state
        const index = this.incomingRequestsList.findIndex(
          (r) => r.id === request.id
        );
        if (index !== -1) {
          this.incomingRequestsList[index].requestStatus = 'rejected';
        }

        // ✅ Recalculate earnings (rejected requests don't count)
        this.paymentsList = this.incomingRequestsList.filter(
          (req) =>
            req.requestStatus === 'accepted' ||
            req.requestStatus === 'completed'
        );
        this.calculateEarnings();
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
