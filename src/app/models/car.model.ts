import { CarModel } from './car-model.model';
import { User } from './user.model';

export type RequestType = 'rent' | 'buy' ;
export type CarAvailability = 'available' | 'unavailable';

export interface Car {
  id: string;
  ownerId: User['id'];
  modelId: CarModel['id'];
  brand: CarModel['brand'];
  name: CarModel['name'];
  description: string;
  pricePerDay?: number;
  price?: number;
  imageUrls: string[];
  isAvailable: CarAvailability;
  requestType: RequestType;
  city: string;
  country: string;
}
