import { CanActivateChildFn,Router} from '@angular/router';
import { inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();
  const token = localStorage.getItem('token');
  if (token&&!jwtHelper.isTokenExpired(token)) {
    return true;
  }
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  router.navigate(['/login']);
  return false;

};
