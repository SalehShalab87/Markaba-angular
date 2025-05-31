import { CarModel } from './car-model.model';
import { User } from './user.model';

export type RequestType = 'rent' | 'buy' ;
export type CarAvailability = 'available' | 'unavailable';
export type EngineType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type TransmissionType = 'manual' | 'automatic' | 'cvt';
export type DriveType = 'fwd' | 'rwd' | 'awd' | '4wd';
export type ConditionType = 'excellent' | 'good' | 'fair' | 'poor';

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
  year?: number;
  mileage?: number;
  transmission?: TransmissionType;
  engineType?: EngineType;
  engineSize?: string; 
  cylinders?: number;
  horsepower?: number;
  fuelEconomy?: string; 
  driveType?: DriveType;
  seats?: number;
  doors?: number;
  color?: string;
  condition?: ConditionType;
  safetyRating?: number; 
  features?: string[]; 
}
