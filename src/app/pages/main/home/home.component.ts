import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { Car } from '../../../models/car.model';
import { HomeService } from '../../../core/services/main/home.service';
import { Subscription } from 'rxjs';
import { CarCardComponent } from "../../../shared/components/car-card/car-card.component";
import { CommonModule } from '@angular/common';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
declare var bootstrap: any;
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe, CarCardComponent, CommonModule, LoaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  featuredCarsList!: Car[];
  currentYear: number = new Date().getFullYear();
  private homeService = inject(HomeService);
  subscriptions: Subscription[] = [];
  isLoading: boolean = false;

  ngOnInit() {
    this.loadFeaturedCars();
  }

  ngAfterViewInit(): void {
    const element = document.querySelector('#heroCarousel');
    if (element) {
      new bootstrap.Carousel(element, {
        interval: 4000,
        ride: 'carousel',
      });
    }
  }

  loadFeaturedCars() {
    this.isLoading = true;
    const sub = this.homeService.getFeaturedCars().subscribe({
      next: (cars: Car[]) => {
        this.isLoading = false;
        this.featuredCarsList = cars;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
