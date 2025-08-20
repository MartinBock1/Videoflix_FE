import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Interface for user registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  confirmed_password: string;
}

/**
 * Interface for user login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface for forgot password data
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Interface for password reset data
 */
export interface ResetPasswordData {
  token: string;
  password: string;
}

/**
 * Interface for API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * Interface for user data
 */
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Authentication service handling all auth-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private readonly API_BASE_URL = 'http://127.0.0.1:8000/api/';
  private readonly API_BASE_URL = 'http://localhost:8000/api/';
  private readonly LOGIN_URL = 'login/';
  private readonly REGISTER_URL = 'register/';
  private readonly FORGET_PASSWORD_URL = 'password_reset/';
  private readonly REFRESH_URL = 'token/refresh/';
  private readonly ACTIVATE_URL = 'activate/';
  private readonly CONFIRM_PASSWORD_URL = 'confirm_password/';

  // Current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  /**
   * Check if user is authenticated on service initialization
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      // TODO: Validate token with backend
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Register a new user
   */
  register(userData: RegisterData): Observable<ApiResponse> {
    return this.http
      .post<any>(this.getFullUrl(this.REGISTER_URL), userData)
      .pipe(
        map((response) => this.handleSuccessResponse(response)),
        catchError((error) => this.handleErrorResponse(error))
      );
  }

  /**
   * Login user - Session-based Authentication
   */
  login(email: string, password: string): Observable<ApiResponse> {
    const loginData: LoginData = { email, password };

    return this.http
      .post<any>(this.getFullUrl(this.LOGIN_URL), loginData, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          const result = this.handleSuccessResponse(response.body);

          if (result.success) {
            // Set authentication status
            this.isAuthenticatedSubject.next(true);

            // Set user data if available
            if (response.body?.user) {
              this.currentUserSubject.next(response.body.user);
            }
          }

          return result;
        }),
        catchError((error) => this.handleErrorResponse(error))
      );
  }

  /**
   * Get CSRF token from Django backend
   */
  getCSRFToken(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}csrf/`, {
      withCredentials: true,
    });
  }

  /**
   * Direct test using native fetch
   */
  testDirectFetch(): Promise<any> {
    return fetch(`${this.API_BASE_URL}video/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then((response) => response.json())
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Test HTTP-Only Cookie JWT authentication by making a simple authenticated request
   */
  testSession(): Observable<ApiResponse> {
    return this.http
      .get<any>(this.getFullUrl('user/'), {
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          return this.handleSuccessResponse(response);
        }),
        catchError((error) => {
          return this.handleErrorResponse(error);
        })
      );
  }

  /**
   * Validate current session
   */
  validateSession(): Observable<ApiResponse> {
    return this.http
      .get<any>(this.getFullUrl('/api/auth/validate/'), {
        withCredentials: true,
      })
      .pipe(
        map((response) => this.handleSuccessResponse(response)),
        catchError((error) => {
          return this.handleErrorResponse(error);
        })
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.removeTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Send forgot password email
   */
  forgotPassword(email: string): Observable<ApiResponse> {
    const data: ForgotPasswordData = { email };

    return this.http
      .post<any>(this.getFullUrl(this.FORGET_PASSWORD_URL), data)
      .pipe(
        map((response) => this.handleSuccessResponse(response)),
        catchError((error) => this.handleErrorResponse(error))
      );
  }

  /**
   * Reset password with uid and token
   */
  resetPassword(
    uid: string,
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<ApiResponse> {
    // Use POST request with uid and token in URL path, like DA_Frontend
    const endpoint = `password_confirm/${encodeURIComponent(
      uid
    )}/${encodeURIComponent(token)}/`;
    const data = {
      new_password: newPassword,
      confirm_password: confirmPassword,
    };

    return this.http.post<any>(this.getFullUrl(endpoint), data).pipe(
      map((response) => this.handleSuccessResponse(response)),
      catchError((error) => this.handleErrorResponse(error))
    );
  }

  /**
   * Activate user account
   */
  activateAccount(uid: string, token: string): Observable<ApiResponse> {
    // Use GET request with uid and token in URL path, like DA_Frontend
    const endpoint = `activate/${encodeURIComponent(uid)}/${encodeURIComponent(
      token
    )}/`;

    return this.http.get<any>(this.getFullUrl(endpoint)).pipe(
      map((response) => this.handleSuccessResponse(response)),
      catchError((error) => this.handleErrorResponse(error))
    );
  }

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    const hasAuthStatus = this.isAuthenticatedSubject.value;
    const hasUser = this.currentUserSubject.value !== null;
    const hasToken = this.getToken() !== null;

    return hasToken || (hasAuthStatus && hasUser);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  /**
   * Set refresh token
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  /**
   * Remove all tokens
   */
  private removeTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Refresh authentication token
   * Not needed for session-based auth
   */
  refreshToken(): Observable<ApiResponse> {
    return throwError(
      () =>
        new Error('Session-based authentication does not support token refresh')
    );
  }

  /**
   * Get authorization headers for HTTP requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  /**
   * Build full URL from relative path
   */
  private getFullUrl(path: string): string {
    return this.API_BASE_URL + path;
  }

  /**
   * Handle successful API responses
   */
  private handleSuccessResponse(response: any): ApiResponse {
    return {
      success: true,
      data: response,
      message: response.message || 'Operation successful',
    };
  }

  /**
   * Handle API error responses
   */
  private handleErrorResponse(error: any): Observable<never> {
    let errorMessages: string[] = [];
    let errorMessage = 'An error occurred';

    if (error.error) {
      // Extract error messages from Django REST framework error format
      if (typeof error.error === 'object') {
        Object.keys(error.error).forEach((key) => {
          const fieldErrors = error.error[key];
          if (Array.isArray(fieldErrors)) {
            errorMessages.push(...fieldErrors);
          } else if (typeof fieldErrors === 'string') {
            errorMessages.push(fieldErrors);
          }
        });
      } else if (typeof error.error === 'string') {
        errorMessages.push(error.error);
      }

      errorMessage =
        errorMessages.length > 0 ? errorMessages.join('. ') : errorMessage;
    }

    const apiError: ApiResponse = {
      success: false,
      errors: errorMessages,
      message: errorMessage,
    };

    return throwError(() => apiError);
  }
}
