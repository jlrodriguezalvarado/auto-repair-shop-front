import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

let loggingOut = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.jwtToken();
  let cloned = req;
  if (token) {
    let headers = req.headers.set('Authorization', `Bearer ${token}`);
    const viewing = auth.viewingCompany();
    if (viewing) {
      headers = headers.set('X-Company-Id', String(viewing.id));
    }
    cloned = req.clone({ headers });
  }
  return next(cloned).pipe(
    catchError((error: any) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/users/token/') &&
        !loggingOut
      ) {
        loggingOut = true;
        void auth.logout().finally(() => {
          loggingOut = false;
        });
      }
      return throwError(() => error);
    })
  );
};
