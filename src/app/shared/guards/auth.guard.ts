import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators'; // tap importieren
import { AuthService } from '../services/auth.service';

export const AuthGuard = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[AuthGuard] Running...');

  if (authService.isAuthenticated()) {
    console.log('%c[AuthGuard] Already authenticated. Access GRANTED.', 'color: green;');
    return of(true);
  }

  console.log('%c[AuthGuard] Not authenticated. Trying to validate session...', 'color: blue;');
  
  return authService.validateSession().pipe(
    tap(isSessionValid => {
      if (!isSessionValid) {
        console.log('%c[AuthGuard] Session validation FAILED. Redirecting to login inside tap().', 'color: red;');
        router.navigate(['/auth/login']);
      }
    }),
    map(isSessionValid => {
      if (isSessionValid) {
        console.log('%c[AuthGuard] Session validation SUCCESS. Access GRANTED.', 'color: green;');
        return true;
      } else {
        return false;
      }
    })
  );
};