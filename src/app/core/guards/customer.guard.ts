import { CanActivateFn } from '@angular/router';

export const CustomerGuard: CanActivateFn = (route, state) => {
  return true;
};
