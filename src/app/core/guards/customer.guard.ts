import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const CustomerGuard: CanActivateFn =(
  route:ActivatedRouteSnapshot, 
  state:RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const userRole = auth.userRole();
  const isLoggedIn = auth.isLoggedIn();
  const isCustomer = (userRole === 'customer');
  if (isLoggedIn && isCustomer) {
    return true;
  } else {
    auth.setRedirectUrl(state.url);
    return router.createUrlTree(['/login']);
  }
};
