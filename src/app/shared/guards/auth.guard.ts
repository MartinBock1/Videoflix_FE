import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * @description
 * A functional route guard that protects routes from unauthorized access.
 * It uses Angular's `inject` function to get instances of the `AuthService` and `Router`.
 *
 * The guard's logic follows a two-step process:
 * 1.  **Synchronous Check:** It first performs a quick, synchronous check using `authService.isAuthenticated()`.
 *     If the user is already authenticated in the current session (e.g., they just logged in),
 *     it immediately grants access without making a network request. This is a performance optimization.
 *
 * 2.  **Asynchronous Validation:** If the user is not locally authenticated, it proceeds to call
 *     `authService.validateSession()`. This makes an asynchronous request to the backend to verify
 *     if a valid session (e.g., an HTTP-Only cookie) exists.
 *
 * The `tap` operator is used for the side effect of redirecting the user to the login page if the
 * session validation fails. The `map` operator then returns the final boolean result to the Angular router.
 *
 * @returns {Observable<boolean>} An `Observable<boolean>` that resolves to `true` if the user is
 * authenticated and access should be granted, or `false` if access is denied.
 */
export const AuthGuard = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First, check for a locally-known authentication status for immediate access.
  if (authService.isAuthenticated()) {
    return of(true);
  }

  // If not locally authenticated, validate the session with the backend.
  return authService.validateSession().pipe(
    // Use `tap` for the side effect of navigating away on failure.
    tap(isSessionValid => {
      if (!isSessionValid) {
        router.navigate(['/auth/login']);
      }
    }),
    // Use `map` to return the final boolean value to the router.
    map(isSessionValid => {
      if (isSessionValid) {
        return true;
      } else {
        return false;
      }
    })
  );
};