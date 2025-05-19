import { CarModel } from './car-model.model';
import { User } from './user.model';

export type RequestType = 'rent' | 'buy' ;

export interface Car {
  id: string;
  ownerId: User['id'];
  modelId: CarModel['id'];
  brand: CarModel['brand'];
  description: string;
  pricePerDay?: number;
  price?: number;
  imageUrl: string;
  // imageUrls: string[];
  isAvailable: boolean;
  requestType: RequestType;
  city: string;
  country: string;
}
