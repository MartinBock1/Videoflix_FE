import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if user is already logged in (from localStorage/sessionStorage)
    this.checkAuthStatus();
  }

  /**
   * Check if user is currently logged in
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<any> {
    // TODO: Implement actual login API call
    console.log('Login attempt:', email);
    
    // Simulate successful login for now
    this.isAuthenticatedSubject.next(true);
    this.setAuthStatus(true);
    
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Register new user
   */
  register(email: string, password: string): Observable<any> {
    // TODO: Implement actual registration API call
    console.log('Register attempt:', email);
    
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    this.isAuthenticatedSubject.next(false);
    this.clearAuthStatus();
  }

  /**
   * Activate account with token
   */
  activateAccount(token: string): Observable<any> {
    // TODO: Implement account activation API call
    console.log('Activate account with token:', token);
    
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<any> {
    // TODO: Implement forgot password API call
    console.log('Forgot password for:', email);
    
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  /**
   * Confirm new password with token
   */
  confirmPassword(token: string, newPassword: string): Observable<any> {
    // TODO: Implement password confirmation API call
    console.log('Confirm password with token:', token);
    
    return new Observable(observer => {
      observer.next({ success: true });
      observer.complete();
    });
  }

  // Private helper methods
  private checkAuthStatus(): void {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      this.isAuthenticatedSubject.next(true);
    }
  }

  private setAuthStatus(status: boolean): void {
    localStorage.setItem('isAuthenticated', status.toString());
  }

  private clearAuthStatus(): void {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');
  }
}
