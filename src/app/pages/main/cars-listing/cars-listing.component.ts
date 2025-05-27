import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../../../core/services/home.service';
import { Car } from '../../../models/car.model';
import { CarCardComponent } from '../../../shared/components/car-card/car-card.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';


@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CarCardComponent, TranslatePipe],
  templateUrl: './cars-listing.component.html',
  styleUrls: ['./cars-listing.component.scss'],
})
export class CarsListingComponent implements OnInit {
  allCars: Car[] = [];
  filteredCars: Car[] = [];
  paginatedCars: Car[] = [];

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;
  totalItems = 0;

  // Filters
  searchTerm = '';
  selectedType = '';
  selectedAvailability = '';
  selectedLocation = '';
  uniqueLocations: string[] = [];

  constructor(private homeService: HomeService) {}

  ngOnInit() {
    this.loadCars();
  }

  private loadCars() {
    this.homeService.getAllCars().subscribe((cars) => {
      this.allCars = cars;
      this.filteredCars = [...cars];
      this.uniqueLocations = [
        ...new Set(cars.map((c) => `${c.city}, ${c.country}`)),
      ];
      this.updatePagination();
    });
  }

  filterCars() {
    this.currentPage = 1;
    this.filteredCars = this.allCars.filter((car) => {
      const searchMatch =
        car.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        car.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        car.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const typeMatch = this.selectedType
        ? car.requestType === this.selectedType
        : true;
      const availabilityMatch = this.selectedAvailability
        ? car.isAvailable === this.selectedAvailability
        : true;
      const locationMatch = this.selectedLocation
        ? `${car.city}, ${car.country}` === this.selectedLocation
        : true;

      return searchMatch && typeMatch && availabilityMatch && locationMatch;
    });

    this.updatePagination();
  }

  private updatePagination() {
    this.totalItems = this.filteredCars.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.paginateCars();
  }

  private paginateCars() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCars = this.filteredCars.slice(startIndex, endIndex);
  }

  // Pagination controls
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateCars();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateCars();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginateCars();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, start) => start + 1);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedAvailability = '';
    this.selectedLocation = '';
    this.filterCars();
  }
}
