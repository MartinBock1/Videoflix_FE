import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

/**
 * HTTP Interceptor function to automatically attach auth tokens and handle token refresh
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth token to request
  const authRequest = addToken(req, authService);

  return next(authRequest).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authRequest, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Add authentication token to request headers
 */
function addToken(request: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  const token = authService.getToken();
  
  if (token) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return request;
}

/**
 * Handle 401 Unauthorized errors by attempting token refresh
 */
function handle401Error(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthService, 
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.data?.access);
        return next(addToken(request, authService));
      }),
      catchError(error => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  } else {
    // Wait for token refresh to complete
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(() => next(addToken(request, authService)))
    );
  }
}
