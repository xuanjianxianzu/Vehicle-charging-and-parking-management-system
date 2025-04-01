import { CanActivateChildFn,Router} from '@angular/router';
import { inject } from '@angular/core';

export const authChildGuard: CanActivateChildFn = (childRoute, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (token) {
    console.log("登陆成功");
    return true;
  }
  console.log("登陆失败");
  router.navigate(['/login']);
  return false;

};
