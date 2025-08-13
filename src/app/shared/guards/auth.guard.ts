import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard to protect routes that require authentication
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Check if user can activate the route
   */
  canActivate(): Observable<boolean> | boolean {
    return this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirect to login page if not authenticated
          this.router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  }

  /**
   * Check if user can load child routes
   */
  canActivateChild(): Observable<boolean> | boolean {
    return this.canActivate();
  }
}
