import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent,HttpResponse,HttpErrorResponse } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req).pipe(
    map(event => {
      console.log(event,'asdasdasdasd')
      if (event instanceof HttpResponse) {
        const modifiedBody = event.body;
        return event.clone({ body: modifiedBody });
      }
      return event;
    }),
    
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log('HTTP 响应成功', event.status);
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error(err.error.message);
        if (err.status === 403&&err.error.message=='账户已被禁用或不存在') {
          router.navigate(['/login']);
        }
      }
    })
  );
};