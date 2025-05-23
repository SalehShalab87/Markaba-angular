import { Component, inject } from '@angular/core';
import { ClientService } from '../../../core/services/client.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth.service';
import { User } from '../../../models/user.model';
import { Car, RequestType } from '../../../models/car.model';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { finalize } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { CarModel } from '../../../models/car-model.model';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { ShortenUrlPipe } from '../../../shared/pipes/shorten-url.pipe';

@Component({
  selector: 'app-cars',
  imports: [CommonModule, ReactiveFormsModule, LoaderComponent, ShortenUrlPipe,TitleCasePipe],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss',
})
export class CarsComponent {
  private auth = inject(AuthService);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  currentClient: User | null = this.auth.currentUser();
  requestTypes: RequestType[] = ['rent', 'buy'];
  carForm!: FormGroup;
  isLoading: boolean = false;
  isUploading = false;
  uploadProgress = 0;
  carModels: CarModel[] = [];
  isLoadingModels = false;

  ngOnInit() {
    this.FormHandler();
    this.loadCarModels();
    this.setupBrandAutoFill();
    this.setPriceValidators();
  }

  FormHandler() {
    this.carForm = this.fb.group({
      ownerId: [this.currentClient?.id || '', Validators.required],
      modelId: ['', Validators.required],
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      pricePerDay: [null, [Validators.min(0)]],
      price: [null, [Validators.min(0)]],
      imageUrls: this.fb.array([], Validators.required),
      isAvailable: [true],
      requestType: ['rent', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
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
          Validators.min(0),
        ]);
      } else {
        pricePerDayControl?.clearValidators();
        priceControl?.setValidators([Validators.required, Validators.min(0)]);
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

 onSubmit() {
  if (this.carForm?.invalid) {
    this.carForm.markAllAsTouched();
    return;
  }

  const carData: Car = {
    ...this.carForm?.value,
    id: '',
    ownerId: this.currentClient?.id || '',
    isAvailable: this.carForm?.value.isAvailable || true,
  };
  
  this.isLoading = true;
  this.clientService.addNewCar(carData).subscribe({
    next: (response) => {
      console.log(response);
      this.isLoading = false;
      
      this.carForm?.reset();
      this.FormHandler(); 
      
      const successTranslationKey = 'toast.success.register';
      this.toast.showSuccess(successTranslationKey);
    },
    error: (error) => {
      console.log(error);
      this.isLoading = false;
      
      // Show error toast
      const errorTranslationKey = 'toast.error.register';
      this.toast.showError(errorTranslationKey);
    },
  });
}

  loadCarModels() {
    this.isLoadingModels = true;
    this.clientService.getCarModels().subscribe({
      next: (models) => {
        this.carModels = models;
        this.isLoadingModels = false;
      },
      error: (err) => {
        console.error('Failed to load car models', err);
        this.isLoadingModels = false;
      },
    });
  }

  setupBrandAutoFill(): void {
    this.carForm?.get('modelId')?.valueChanges.subscribe(modelId => {
      const selectedModel = this.carModels.find(m => m.id === modelId);
      
      this.carForm?.get('brand')?.setValue(selectedModel?.brand || '');
    });
  }
}
