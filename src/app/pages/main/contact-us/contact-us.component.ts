import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact-us',
  imports: [ReactiveFormsModule,CommonModule,TranslatePipe],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {
  contactForm!: FormGroup;
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  ngOnInit(){
    this.initializeContactForm();
  }

  initializeContactForm(){
    this.contactForm = this.fb.group({
      name: ['',Validators.required],
      email: ['',[Validators.required, Validators.email]],
      subject: ['',Validators.required],
      message: ['',Validators.required]
    })
  }

  onSubmit(){
    //TODO: Implement form submission logic
    const translationKey = 'toast.success.contactFormSubmitted';
    this.toast.showSuccess(translationKey);
    this.contactForm.reset();
  }

}
