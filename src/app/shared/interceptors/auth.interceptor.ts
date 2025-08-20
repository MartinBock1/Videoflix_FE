import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

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
 * Add authentication to request (Session-based wie JavaScript Frontend)
 */
function addToken(request: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  // Session-based Authentication with credentials
  let authRequest = request.clone({
    withCredentials: true
  });
  
  return authRequest;
}

/**
 * Handle 401 Unauthorized errors
 */
function handle401Error(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthService, 
  router: Router
): Observable<HttpEvent<unknown>> {
  // For session-based auth: no token refresh, direct logout
  authService.logout();
  router.navigate(['/auth/login']);
  
  return throwError(() => new Error('Session expired. Please login again.'));
}
