import { CurrencyPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { RequestService } from '../../../core/services/main/request.service';
import { ToastService } from '../../../core/services/main/toast.service';
import { Car } from '../../../models/car.model';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { DatePicker } from 'primeng/datepicker';
import { Request } from '../../../models/car-request.model';


@Component({
  selector: 'app-buy-request-modal',
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    CurrencyPipe,
    CommonModule,
    DatePicker,
  ],
  templateUrl: './buy-request-modal.component.html',
  styleUrl: './buy-request-modal.component.scss',
})
export class BuyRequestModalComponent implements OnInit, OnChanges {
  @Input({ required: true }) isVisible = false;
  @Input() car: Car | null = null; 
  @Input() carOwner: User | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() requestSubmitted = new EventEmitter<void>();

  requestForm!: FormGroup;
  today = new Date();
  isSubmitting = false;

  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private requestService = inject(RequestService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['car'] && this.car) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    this.requestForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      notes: ['', [Validators.maxLength(500)]],
    });

    this.setupFormValidation();
  }

  private setupFormValidation() {
    if (this.car?.requestType === 'rent') {
      this.requestForm.get('startDate')?.setValidators([Validators.required]);
      this.requestForm.get('endDate')?.setValidators([Validators.required]);
    } else {
      this.requestForm.get('startDate')?.clearValidators();
      this.requestForm.get('endDate')?.clearValidators();
    }

    this.requestForm.get('startDate')?.updateValueAndValidity();
    this.requestForm.get('endDate')?.updateValueAndValidity();
  }

  OnSubmitRequest() {
    this.requestForm.markAllAsTouched();

    if (this.requestForm.valid && this.car && this.carOwner) {
      this.isSubmitting = true;

      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        this.toast.showError('car-details.loginRequired');
        this.isSubmitting = false;
        return;
      }

      const formData = this.requestForm.value; 
      const requestData: Request = {
        id: crypto.randomUUID(),
        carId: this.car.id,
        customerId: currentUser.id,
        ownerId: this.carOwner.id,
        requestType: this.car.requestType,
        notes: formData.notes || undefined,
        createdAt: new Date().toLocaleString(),
        requestStatus: 'pending',
        paymentStatus: 'pending',
        paymentAmount: this.getTotalCost(),
      };

    
      if (this.car.requestType === 'rent') {
        requestData.startDate = formData.startDate.toLocaleDateString();
        requestData.endDate = formData.endDate.toLocaleDateString();
      }

      console.log('Submitting request:', requestData);

      this.requestService.createRequest(requestData).subscribe({
        next: () => {
          this.isSubmitting = false;
          
          const successKey = 'car-details.requestSubmissionSuccess'
          
          this.toast.showSuccess(successKey);
          this.requestForm.reset();
          this.requestSubmitted.emit();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error submitting request:', error);
          this.toast.showError('car-details.requestSubmitError');
        }
      });
    } 
  }

  // Helper method to calculate total days for rent
  getTotalDays(): number {
    const startDate = this.requestForm.get('startDate')?.value;
    const endDate = this.requestForm.get('endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return dayDiff > 0 ? dayDiff : 0;
    }
    
    return 0;
  }

  // Helper method to calculate total cost for rent
  getTotalCost(): number {
    if (this.car?.requestType === 'rent' && this.car.pricePerDay) {
      return this.getTotalDays() * this.car.pricePerDay;
    }
    return this.car?.price || 0;
  }
}
