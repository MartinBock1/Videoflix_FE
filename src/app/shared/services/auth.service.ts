import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// =================================================================
// Data Interfaces
// =================================================================

/**
 * Defines the data structure for a user registration request.
 */
export interface RegisterData {
  email: string;
  password: string;
  confirmed_password: string;
}

/**
 * Defines the data structure for a user login request.
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Defines the data structure for a "forgot password" request.
 */
export interface ForgotPasswordData {
  email: string;
}

/**
 * Defines the data structure for a password reset confirmation.
 */
export interface ResetPasswordData {
  token: string;
  password: string;
}

/**
 * A generic wrapper for standardized API responses from the backend.
 * @template T The type of the `data` payload, if any.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

/**
 * Defines the data structure for a user object.
 */
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

// =================================================================
// AuthService Class
// =================================================================

/**
 * @Injectable
 * Provided in the root, making it a singleton service available throughout the application.
 *
 * @description
 * Handles all authentication-related concerns, including user registration, login,
 * session validation, and state management. It communicates with the backend API
 * and maintains the application's authentication state via RxJS BehaviorSubjects.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // =================================================================
  // API Endpoint Configuration
  // =================================================================

  // private readonly API_BASE_URL = 'http://127.0.0.1:8000/api/';
  private readonly API_BASE_URL = 'http://localhost:8000/api/';
  private readonly VALIDATE_URL = 'user/';
  private readonly LOGIN_URL = 'login/';
  private readonly REGISTER_URL = 'register/';
  private readonly FORGET_PASSWORD_URL = 'password_reset/';
  private readonly REFRESH_URL = 'token/refresh/';
  private readonly ACTIVATE_URL = 'activate/';
  private readonly CONFIRM_PASSWORD_URL = 'confirm_password/';

  // =================================================================
  // State Management
  // =================================================================

  // Current user state
  /**
   * @private The BehaviorSubject holding the current user's data.
   */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  /**
   * @public An observable stream of the current user, allowing components to react to user changes.
   */
  public currentUser$ = this.currentUserSubject.asObservable();

  // Authentication state
  /**
   * @private The BehaviorSubject holding the current authentication status.
   */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  /**
   * @public An observable stream of the authentication status.
   */
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Constructs the AuthService.
   * @param {HttpClient} http The Angular service for making HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * Registers a new user with the backend.
   * @param {RegisterData} userData The user's registration details.
   * @returns {Observable<ApiResponse>} An observable of the API response.
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
   * Logs in a user using session-based authentication.
   * On success, it updates the `isAuthenticatedSubject` and `currentUserSubject`.
   * @param {string} email The user's email address.
   * @param {string} password The user's password.
   * @returns {Observable<ApiResponse>} An observable of the API response.
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
   * Fetches a CSRF token from the Django backend.
   * @returns {Observable<any>} An observable containing the CSRF token response.
   */
  getCSRFToken(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}csrf/`, {
      withCredentials: true,
    });
  }

  /**
   * A direct test method using the native Fetch API for debugging purposes.
   * @returns {Promise<any>} A promise that resolves with the JSON response.
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
   * A test method to verify HTTP-Only cookie authentication by making an authenticated request.
   * @returns {Observable<ApiResponse>} An observable of the API response.
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
   * Validates the current user session by making an authenticated request to a protected endpoint.
   * Updates the application's authentication state based on the outcome.
   * @returns {Observable<boolean>} An observable that emits `true` for a valid session, and `false` otherwise.
   */
  validateSession(): Observable<boolean> {
    return this.http
      .get<any[]>(this.getFullUrl('video/'), { withCredentials: true })
      .pipe(
        map(() => {
          this.isAuthenticatedSubject.next(true);
          return true;
        }),
        catchError(() => {
          this.isAuthenticatedSubject.next(false);
          this.currentUserSubject.next(null);
          return of(false);
        })
      );
  }

  /**
   * Logs out the current user by clearing local state.
   * Note: For session auth, a backend logout endpoint should also be called if it exists.
   * @returns {void}
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Sends a password reset request to the backend for the given email.
   * @param {string} email The user's email address.
   * @returns {Observable<ApiResponse>} An observable of the API response.
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
   * Submits a new password to the backend using the UID and token from the password reset email.
   * @param {string} uid The user's unique identifier.
   * @param {string} token The password reset token.
   * @param {string} newPassword The new password.
   * @param {string} confirmPassword The confirmation of the new password.
   * @returns {Observable<ApiResponse>} An observable of the API response.
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
   * Activates a user account using the UID and token from the activation email.
   * @param {string} uid The user's unique identifier.
   * @param {string} token The account activation token.
   * @returns {Observable<ApiResponse>} An observable of the API response.
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
   * Synchronously checks if the user is currently authenticated based on the service's state.
   * @returns {boolean} `true` if the user is authenticated, `false` otherwise.
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Synchronously gets the current user's data.
   * @returns {User | null} The current user object, or `null` if no user is logged in.
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }  

  /**
   * Constructs the full API URL for a given relative path.
   * @private
   * @param {string} path The relative path of the API endpoint.
   * @returns {string} The complete URL.
   */
  private getFullUrl(path: string): string {
    return this.API_BASE_URL + path;
  }

  /**
   * A helper function to wrap a successful API response in the standard `ApiResponse` format.
   * @private
   * @param {any} response The raw data from a successful HTTP response.
   * @returns {ApiResponse} The standardized success response object.
   */
  private handleSuccessResponse(response: any): ApiResponse {
    return {
      success: true,
      data: response,
      message: response.message || 'Operation successful',
    };
  }

  /**
   * A centralized error handler that transforms a raw `HttpErrorResponse` into a
   * standardized `ApiResponse` format and returns it as an RxJS `throwError`.
   * @private
   * @param {any} error The error object from an `HttpClient` request.
   * @returns {Observable<never>} An observable that immediately emits an error.
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
