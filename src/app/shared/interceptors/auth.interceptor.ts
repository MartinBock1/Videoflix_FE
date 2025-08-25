import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * A functional HTTP Interceptor that handles authentication for outgoing requests.
 *
 * @description
 * This interceptor performs two main tasks:
 * 1.  It automatically includes credentials (like HTTP-Only cookies) in every HTTP request
 *     to ensure the user remains authenticated with the backend.
 * 2.  It catches `401 Unauthorized` errors, which typically indicate an expired or invalid session.
 *     Upon catching such an error, it logs the user out and redirects them to the login page.
 *
 * @param {HttpRequest<unknown>} req The outgoing HTTP request.
 * @param {HttpHandlerFn} next The next interceptor in the chain or the backend handler.
 * @returns {Observable<HttpEvent<unknown>>} An observable of the HTTP event stream.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clone the request to include credentials for session-based authentication.
  const authRequest = req.clone({
    withCredentials: true
  });

  return next(authRequest).pipe(
    catchError(error => {
      // If a 401 Unauthorized error occurs, handle it.
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authService, router);
      }
      // For all other errors, pass them through.
      return throwError(() => error);
    })
  );
};

/**
 * Handles the 401 Unauthorized error by logging the user out and redirecting to the login page.
 *
 * @private
 * @param {AuthService} authService The authentication service instance.
 * @param {Router} router The router instance for navigation.
 * @returns {Observable<HttpEvent<unknown>>} An observable that throws an error to stop the request chain.
 */
function handle401Error(authService: AuthService, router: Router): Observable<HttpEvent<unknown>> {
  // For session-based auth, there's no token to refresh, so we perform a direct logout.
  authService.logout();
  router.navigate(['/auth/login']);

  // Throw a new error to inform the caller that the request failed.
  return throwError(() => new Error('Session expired. Please login again.'));
}
