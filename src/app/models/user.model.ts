export type UserRole = 'admin' | 'client' | 'customer';
export type AccountStatus = 'pending' | 'approved' | 'rejected';


export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  accountStatus?: AccountStatus;
  phone?: string;
  address?: string;
  profileImage?: string;
  dateOfBirth?: string;
}
