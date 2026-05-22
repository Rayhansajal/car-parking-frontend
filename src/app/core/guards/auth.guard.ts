import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
 const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Save the URL user tried to visit
  router.navigate(['/auth'], { 
    queryParams: { returnUrl: state.url } 
  });
  
  return false;
};
