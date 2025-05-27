import { Component, Input } from '@angular/core';
import { Car } from '../../../models/car.model';
import { CommonModule} from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-car-card',
  imports: [CommonModule,RouterLink,TranslatePipe],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.scss'
})
export class CarCardComponent {
  @Input({required:true}) car!: Car;
}
