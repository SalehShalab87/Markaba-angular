import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const NoAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const isLoggedIn = auth.isLoggedIn();
  if (isLoggedIn) {
    auth.redirectUserByRole();
    return false; 
  }else{
    return true; 
  }
};
