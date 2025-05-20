import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

export const superAuthGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const jwtHelper = new JwtHelperService();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (token&&!jwtHelper.isTokenExpired(token)&&role=='super_admin') {
    console.log("认证成功super");
    return true;
  }
  console.log(token);
  console.log("认证无效或过期super");
  router.navigate(['/login']);
  return false;
};
