import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Car } from '../../../models/car.model';
import { User } from '../../../models/user.model';
import { HomeService } from '../../../core/services/home.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { BuyRequestModalComponent } from "../../../shared/buy-request-modal/buy-request-modal.component";

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    LoaderComponent,
    TranslatePipe,
    BuyRequestModalComponent
],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.scss',
})
export class CarDetailsComponent implements OnInit {
  car: Car | null = null;
  owner: User | null = null;
  selectedImage: string = '';
  isLoading = true;
  isBuyRequestModalVisible = false;

  private route = inject(ActivatedRoute);
  private homeService = inject(HomeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  auth = inject(AuthService);

  ngOnInit() {
    this.loadCarDetails();
  }

  private loadCarDetails() {
    const carId = this.route.snapshot.paramMap.get('id');

    this.homeService.getCarById(carId!).subscribe({
      next: (car) => {
        this.car = car;
        this.selectedImage = car.imageUrls[0] || '';
        this.loadOwnerDetails(car.ownerId);
      },
      error: () => {
        this.isLoading = false;
        this.toastService.showError('Failed to load car details');
      },
    });
  }

  private loadOwnerDetails(ownerId: string) {
    this.homeService.getUserById(ownerId).subscribe({
      next: (owner) => {
        this.owner = owner;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  selectImage(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  showBuyRequestModal() {
    this.isBuyRequestModalVisible = true;
  }

  onRentCar() {
    if (!this.auth.isLoggedIn()) {
      this.toastService.showError('car-details.loginRequired');
      this.auth.setRedirectUrl(this.router.url);
      this.router.navigateByUrl('/login');
      return;
    }
    this.showBuyRequestModal();
  }

  onBuyCar() {
    if (!this.auth.isLoggedIn()) {
      this.toastService.showError('car-details.loginRequired');
      this.auth.setRedirectUrl(this.router.url);
      this.router.navigateByUrl('/login');
      return;
    }
    this.showBuyRequestModal();
  }

  onContactOwner() {
    this.toastService.showInfo('car-details.contactFeatureComingSoon');
  }

  onRequestSubmitted() {
    this.isBuyRequestModalVisible = false;
  }
}
