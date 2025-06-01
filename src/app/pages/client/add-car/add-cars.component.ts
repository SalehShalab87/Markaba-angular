import { Component, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { User } from '../../../models/user.model';
import {
  Car,
  RequestType,
  TransmissionType,
  EngineType,
  DriveType,
  ConditionType,
} from '../../../models/car.model';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/main/toast.service';
import { finalize } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { CarModel } from '../../../models/car-model.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ShortenUrlPipe } from '../../../shared/pipes/shorten-url.pipe';
import { ClientService } from '../../../core/services/client/client.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-cars',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoaderComponent,
    ShortenUrlPipe,
    TranslatePipe,
  ],
  templateUrl: './add-cars.component.html',
  styleUrl: './add-cars.component.scss',
})
export class AddCarsComponent implements OnInit {
  private auth = inject(AuthService);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentClient: User | null = this.auth.currentUser();
  currentYear = new Date().getFullYear();
  currentLanguage: string = 'en';
  isRTL: boolean = false;

  // Edit mode properties
  isEditMode = false;
  carId: string | null = null;
  currentCar: Car | null = null;

  // Form control options
  requestTypes: RequestType[] = ['rent', 'buy'];
  transmissionTypes: TransmissionType[] = ['manual', 'automatic', 'cvt'];
  engineTypes: EngineType[] = ['petrol', 'diesel', 'hybrid', 'electric'];
  driveTypes: DriveType[] = ['fwd', 'rwd', 'awd', '4wd'];
  conditionTypes: ConditionType[] = ['excellent', 'good', 'fair', 'poor'];
  seatOptions: number[] = [2, 4, 5, 6, 7, 8];
  doorOptions: number[] = [2, 3, 4, 5];

  availableFeatures: string[] = [
    'gps',
    'bluetooth',
    'backupCamera',
    'sunroof',
    'leatherSeats',
    'heatedSeats',
    'airConditioning',
    'cruiseControl',
    'parkingSensors',
    'blindSpotMonitoring',
    'adaptiveCruiseControl',
    'laneKeepAssist',
  ];

  carForm!: FormGroup;
  isLoading: boolean = false;
  isUploading = false;
  uploadProgress = 0;
  carModels: CarModel[] = [];
  isLoadingModels = false;

  ngOnInit() {
    this.currentLanguage = localStorage.getItem('lang') || 'en';
    this.isRTL = this.currentLanguage === 'ar';
    this.checkEditMode();
    this.FormHandler();
    this.loadCarModels();
    this.setupBrandAutoFill();
    this.setPriceValidators();
  }

  checkEditMode() {
    this.carId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.carId;

    if (this.isEditMode && this.carId) {
      this.loadCarForEdit(this.carId);
    }
  }

  loadCarForEdit(carId: string) {
    this.isLoading = true;
    this.clientService.getCarById(carId).subscribe({
      next: (car: Car) => {
        this.currentCar = car;
        this.populateFormForEdit(car);
        this.isLoading = false;
      },
      error: () => {
        this.toast.showError('editCar.carNotFound');
        this.router.navigate(['/client/my-cars']);
        this.isLoading = false;
      },
    });
  }

  populateFormForEdit(car: Car) {
    // Populate basic form fields
    this.carForm.patchValue({
      ownerId: car.ownerId,
      modelId: car.modelId,
      brand: car.brand,
      requestType: car.requestType,
      year: car.year,
      condition: car.condition,
      pricePerDay: car.pricePerDay,
      price: car.price,
      transmission: car.transmission,
      engineType: car.engineType,
      engineSize: car.engineSize,
      horsepower: car.horsepower,
      mileage: car.mileage,
      fuelEconomy: car.fuelEconomy,
      seats: car.seats,
      doors: car.doors,
      color: car.color,
      driveType: car.driveType,
      description: car.description,
      city: car.city,
      country: car.country,
      isAvailable: car.isAvailable === 'available',
    });

    // Populate image URLs
    const imageUrlsArray = this.carForm.get('imageUrls') as FormArray;
    imageUrlsArray.clear();
    car.imageUrls?.forEach((url) => {
      imageUrlsArray.push(this.fb.control(url));
    });

    // Populate selected features into FormArray
    const featuresArray = this.carForm.get('features') as FormArray;
    featuresArray.clear();
    car.features?.forEach((feature) => {
      featuresArray.push(this.fb.control(feature));
    });
  }

  FormHandler() {
    this.carForm = this.fb.group({
      // Basic Information
      ownerId: [this.currentClient?.id || '', Validators.required],
      modelId: ['', Validators.required],
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      requestType: ['rent', Validators.required],
      year: [null],
      condition: [''],

      // Pricing
      pricePerDay: [null],
      price: [null],

      // Specifications
      transmission: [''],
      engineType: [''],
      engineSize: [''],
      horsepower: [null, [Validators.min(50)]],
      mileage: [null, [Validators.min(0)]],
      fuelEconomy: [''],
      seats: [null],
      doors: [null],
      color: [''],
      driveType: [''],

      // Additional Info
      description: ['', [Validators.required, Validators.maxLength(500)]],
      city: ['', Validators.required],
      country: ['', Validators.required],

      // Images and Status
      imageUrls: this.fb.array([], Validators.required),
      isAvailable: [true],
      features: this.fb.array([]),
    });
  }

  setPriceValidators() {
    const pricePerDayControl = this.carForm?.get('pricePerDay');
    const priceControl = this.carForm?.get('price');
    const requestTypeControl = this.carForm?.get('requestType');

    requestTypeControl?.valueChanges.subscribe((type) => {
      if (type === 'rent') {
        priceControl?.clearValidators();
        pricePerDayControl?.setValidators([
          Validators.required,
          Validators.min(1),
        ]);
      } else {
        pricePerDayControl?.clearValidators();
        priceControl?.setValidators([Validators.required, Validators.min(1)]);
      }
      priceControl?.updateValueAndValidity();
      pricePerDayControl?.updateValueAndValidity();
    });
  }

  async uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    this.isUploading = true;
    this.uploadProgress = 0;
    const totalFiles = files.length;
    let completedUploads = 0;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        await this.uploadSingleImage(file);
        completedUploads++;
        this.uploadProgress = (completedUploads / totalFiles) * 100;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      this.toast.showError('addCar.uploadError');
    } finally {
      this.isUploading = false;
      this.uploadProgress = 0;
      input.value = '';
    }
  }

  private uploadSingleImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clientService
        .uploadImage(file)
        .pipe(finalize(() => resolve()))
        .subscribe({
          next: (event) => {
            if (event.type === HttpEventType.UploadProgress) {
              const fileProgress = Math.round(
                100 * (event.loaded / (event.total || 1))
              );
              this.uploadProgress = fileProgress;
            } else if (event.type === HttpEventType.Response) {
              this.imageUrls.push(this.fb.control(event.body?.secure_url));
            }
          },
          error: (err) => {
            console.error('Upload error:', err);
            reject(err);
          },
        });
    });
  }

  get imageUrls(): FormArray {
    return this.carForm?.get('imageUrls') as FormArray;
  }

  removeImageUrl(index: number) {
    this.imageUrls.removeAt(index);
  }

  get featuresArray(): FormArray {
    return this.carForm.get('features') as FormArray;
  }

  toggleFeature(feature: string): void {
    const index = this.featuresArray.controls.findIndex(
      (ctrl) => ctrl.value === feature
    );

    if (index === -1) {
      this.featuresArray.push(this.fb.control(feature));
    } else {
      this.featuresArray.removeAt(index);
    }
  }

  onSubmit() {
    if (this.carForm?.invalid) {
      this.carForm.markAllAsTouched();
      this.imageUrls.markAsTouched();
      return;
    }

    const formValue = this.carForm?.value;

    if (this.isEditMode && this.carId) {
      this.updateCar(formValue);
    } else {
      this.createCar(formValue);
    }
  }

  createCar(formValue: any) {
    const carData: Car = {
      ...formValue,
      id: crypto.randomUUID(),
      ownerId: this.currentClient?.id || '',
      isAvailable: formValue.isAvailable ? 'available' : 'unavailable',
      features: this.featuresArray.value,
      createdAt: new Date().toISOString(),
    };

    this.isLoading = true;
    this.clientService.addNewCar(carData).subscribe({
      next: (response: Car) => {
        console.log(response);
        this.isLoading = false;
        this.carForm?.reset();
        this.FormHandler();
        this.toast.showSuccess('addCar.success');
      },
      error: (error: any) => {
        console.log(error);
        this.isLoading = false;
        this.toast.showError('addCar.error');
      },
    });
  }

  updateCar(formValue: any) {
    const updatedCar: Car = {
      ...this.currentCar!,
      ...formValue,
      id: this.carId!,
      isAvailable: formValue.isAvailable ? 'available' : 'unavailable',
      features: this.featuresArray.value,
      updatedAt: new Date().toISOString(),
    };

    this.isLoading = true;
    this.clientService.updateCar(this.carId!, updatedCar).subscribe({
      next: () => {
        this.toast.showSuccess('editCar.updateSuccess');
        this.router.navigate(['/client/my-cars']);
        this.isLoading = false;
      },
      error: () => {
        this.toast.showError('editCar.updateError');
        this.isLoading = false;
      },
    });
  }

  onCancel() {
    if (this.isEditMode) {
      this.router.navigate(['/client/my-cars']);
    } else {
      this.carForm?.reset();
      this.FormHandler();
    }
  }

  loadCarModels() {
    this.isLoadingModels = true;
    this.clientService.getCarModels().subscribe({
      next: (models: CarModel[]) => {
        this.carModels = models;
        this.isLoadingModels = false;
      },
      error: (err: Error) => {
        this.toast.showError('addCar.modelsLoadError');
        this.isLoadingModels = false;
      },
    });
  }

  setupBrandAutoFill() {
    this.carForm.get('modelId')?.valueChanges.subscribe((modelId) => {
      const model = this.carModels.find((m) => m.id === modelId);
      if (model) {
        this.carForm.get('brand')?.setValue(model.brand);
      }
    });
  }
}
