import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

let loggingOut = false;

function isAuthTokenUrl(url: string): boolean {
  return url.includes('/users/token/');
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.jwtToken();
  let cloned = req;
  if (token && !isAuthTokenUrl(req.url)) {
    let headers = req.headers.set('Authorization', `Bearer ${token}`);
    const viewing = auth.viewingCompany();
    if (viewing) {
      headers = headers.set('X-Company-Id', String(viewing.id));
    }
    cloned = req.clone({ headers });
  }
  return next(cloned).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthTokenUrl(req.url) || loggingOut) {
        return throwError(() => error);
      }
      return auth.refreshAccessToken().pipe(
        switchMap((access) => {
          let headers = req.headers.set('Authorization', `Bearer ${access}`);
          const viewing = auth.viewingCompany();
          if (viewing) {
            headers = headers.set('X-Company-Id', String(viewing.id));
          }
          return next(req.clone({ headers }));
        }),
        catchError((refreshError) => {
          if (!loggingOut) {
            loggingOut = true;
            void auth.logout().finally(() => {
              loggingOut = false;
            });
          }
          return throwError(() => refreshError);
        })
      );
    })
  );
};
