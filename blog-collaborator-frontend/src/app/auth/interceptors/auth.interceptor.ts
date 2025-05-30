import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

const addTokenHeader = (request: HttpRequest<any>, token: string) => {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
};

const handle401Error = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<any>> => {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((success: boolean) => {
        isRefreshing = false;
        if (success) {
          const newToken = authService.getToken();
          if (newToken) {
            refreshTokenSubject.next(newToken);
            return next(addTokenHeader(request, newToken));
          } else {
            authService.logout();
            router.navigate(['/auth/login'], { queryParams: { sessionExpired: true } });
            return throwError(() => new Error('Token refresh reported success but no token found.'));
          }
        } else {
          authService.logout();
          router.navigate(['/auth/login'], { queryParams: { sessionExpired: true } });
          return throwError(() => new Error('Token refresh failed.'));
        }
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/auth/login'], { queryParams: { sessionExpired: true } });
        return throwError(() => err);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        if (jwt) {
          return next(addTokenHeader(request, jwt));
        }
        return throwError(() => new Error('Failed to acquire token after refresh.'));
      })
    );
  }
};

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  let authReq = req;

  const isAuthEndpoint = req.url.includes('/api/auth/');
  const isRefreshEndpoint = req.url.includes('/api/auth/refresh-token');

  const token = authService.getToken();
  if (token && !isAuthEndpoint) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (isRefreshEndpoint) {
          authService.logout();
          router.navigate(['/auth/login'], { queryParams: { sessionExpired: true } });
          return throwError(() => new Error('Refresh token attempt failed with 401.'));
        }

        if (isAuthEndpoint) {
          return throwError(() => error);
        }

        return handle401Error(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};
