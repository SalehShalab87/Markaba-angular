import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Car } from '../../../models/car.model';
import { User } from '../../../models/user.model';
import { HomeService } from '../../../core/services/home.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    LoaderComponent,
    TranslatePipe,
  ],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.scss',
})
export class CarDetailsComponent implements OnInit {
  car: Car | null = null;
  owner: User | null = null;
  selectedImage: string = '';
  isLoading = true;

  private route = inject(ActivatedRoute);
  private homeService = inject(HomeService);
  private toastService = inject(ToastService);
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

  onRentCar() {
    this.toastService.showSuccess('car-details.rentRequestSubmitted');
  }

  onBuyCar() {
    this.toastService.showSuccess('car-details.buyRequestSubmitted');
  }

  onContactOwner() {
    this.toastService.showInfo('car-details.contactFeatureComingSoon');
  }
}
