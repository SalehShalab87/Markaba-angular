import { Car, RequestType } from './car.model';
import { User } from './user.model';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Request {
  id: string;
  carId: Car['id'];
  customerId: User['id'];
  ownerId: User['id'];
  requestType: RequestType;
  requestStatus: RequestStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  notes?: string;
}
