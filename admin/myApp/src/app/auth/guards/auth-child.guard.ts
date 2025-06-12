import { CanActivateChildFn,Router} from '@angular/router';
import { inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();
  const token = localStorage.getItem('token');
  if (token&&!jwtHelper.isTokenExpired(token)) {
    console.log("认证成功");
    return true;
  }
  console.log("认证无效或过期");
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  //, { queryParams: { returnUrl: state.url } }
  router.navigate(['/login']);
  return false;

};
