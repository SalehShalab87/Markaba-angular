import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Car } from '../../../models/car.model';
import { ClientService } from '../../../core/services/client/client.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ConfirmationService } from 'primeng/api';
import { I18nService } from '../../../core/services/i18n/i18n.service';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-my-cars',
  imports: [CommonModule, RouterLink, LoaderComponent, TranslatePipe,ConfirmDialog],
  templateUrl: './my-cars.component.html',
  styleUrl: './my-cars.component.scss',
  providers: [ConfirmationService],
})
export class MyCarsComponent implements OnInit, OnDestroy {
  private clientService = inject(ClientService);
  private confirmationService = inject(ConfirmationService);
  private i18n = inject(I18nService);

  clientCars: Car[] = [];
  paginatedCars: Car[] = [];
  isLoading: boolean = false;
  subscriptions: Subscription[] = [];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  ngOnInit() {
    this.loadClientCars();
  }

  loadClientCars() {
    this.isLoading = true;
    const sub = this.clientService.getClientCars().subscribe({
      next: (cars: Car[]) => {
        console.log('Loaded cars:', cars);
        this.clientCars = cars || [];
        this.calculatePagination();
        this.updatePaginatedCars();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        this.isLoading = false;
      },
    });
    this.subscriptions.push(sub);
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.clientCars.length / this.itemsPerPage);
  }

  updatePaginatedCars() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCars = this.clientCars.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedCars();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.clientCars.length
    );
  }

  deleteCar(carId: string) {
    this.confirmationService.confirm({
      message: this.i18n.translate('dialog.deleteCarConfirmation'),
      header: this.i18n.translate('dialog.deleteCarHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.translate('dialog.yes'),
      rejectLabel: this.i18n.translate('dialog.no'),
      acceptButtonStyleClass: 'p-button-danger my-2 me-1',
      rejectButtonStyleClass: 'p-button-secondary my-2 ms-1',
      accept: () => {
        const sub = this.clientService.deleteCar(carId).subscribe({
          next: () => {
            this.loadClientCars();
          },
          error: (error) => {
            // Optionally show error toast
          },
        });
        this.subscriptions.push(sub);
      },
      reject: () => {
        // Optionally handle rejection
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
