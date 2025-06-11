import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const NoAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    const role = auth.currentUser()?.role;
    const status = auth.currentUser()?.accountStatus;

    switch (role) {
      case 'admin':
        return router.parseUrl('/admin');
      case 'client':
        if (status === 'pending') {
          // Optional: store message for later use
          return router.parseUrl('/login');
        }
        return router.parseUrl('/client');
      case 'customer':
        return router.parseUrl('/customer');
      default:
        return router.parseUrl('/');
    }
  }

  return true;
};
