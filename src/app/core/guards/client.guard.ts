import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const ClientGuard: CanActivateFn =(
  route:ActivatedRouteSnapshot, 
  state:RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const userRole = auth.userRole();
  const isLoggedIn = auth.isLoggedIn();
  const isClient = (userRole === 'client');
  if (isLoggedIn && isClient) {
    return true;
  } else {
    auth.setRedirectUrl(state.url);
    return router.createUrlTree(['/login']);
  }
};
