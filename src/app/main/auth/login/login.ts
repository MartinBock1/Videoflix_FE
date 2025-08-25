// =================================================================
// Standard Angular and RxJS Imports
// =================================================================
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute, Params } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';
import { ApiResponse } from '../../../shared/interfaces/api.interfaces';

/**
 * @Component
 * Defines the metadata for the Login component.
 */
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Header, Footer],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  /** 
   * The reactive form group for the login form. 
   */
  loginForm: FormGroup;
  /** 
   * A flag to control the visibility of the password text. 
   */
  showPassword = false;
  /** 
   * A flag to indicate when the form is being submitted. 
   */
  isSubmitting = false;
  /** 
   * A string to hold and display any login error messages. 
   */
  loginError = '';
  /** 
   * A string to hold and display temporary success messages (e.g., from password reset). 
   */
  successMessage = '';

  /** 
   * A timer ID for clearing the success message, used for cleanup in ngOnDestroy. 
   */
  private successTimer?: number;
  /** 
   * Holds the subscription to form changes for cleanup. 
   */
  private formChangesSubscription?: Subscription;

  /**
   * The constructor for the Login component.
   * @param {FormBuilder} fb The Angular service for building reactive forms.
   * @param {Router} router The Angular service for programmatic navigation.
   * @param {AuthService} authService Service for handling authentication API calls.
   * @param {ActivatedRoute} route Service for accessing route parameters.
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.createLoginForm();
  }
  
  // =================================================================
  // Lifecycle Hooks
  // =================================================================

  /**
   * Angular lifecycle hook. Initializes component setup.
   */
  ngOnInit(): void {
    this.checkForSuccessMessage();
    this.setupFormListeners();
  }

  /**
   * Angular lifecycle hook. Cleans up subscriptions and timers.
   */
  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
    if (this.formChangesSubscription) this.formChangesSubscription.unsubscribe();
  }

  // =================================================================
  // Form Setup and Interaction
  // =================================================================

  /**
   * Creates and returns the FormGroup for the login form.
   * @private
   */
  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  /**
   * Subscribes to form value changes to clear the login error on user input.
   * @private
   */
  private setupFormListeners(): void {
    this.formChangesSubscription = this.loginForm.valueChanges.subscribe(() => {
      if (this.loginError) this.loginError = '';
    });
  }

  /**
   * Checks if a form field is invalid and has been touched.
   * @param {string} fieldName The name of the form control to check.
   * @returns {boolean} True if an error should be displayed.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /** 
   * Toggles the visibility of the password in the password input field. 
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // =================================================================
  // Form Submission
  // =================================================================

  /**
   * Orchestrates the form submission process.
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }
    await this.performLogin();
  }

  /**
   * Handles the core logic of the API request for logging in.
   * @private
   */
  private async performLogin(): Promise<void> {
    this.isSubmitting = true;
    this.loginError = '';

    try {
      const { email, password } = this.loginForm.value;
      const result = await lastValueFrom(this.authService.login(email, password));
      this.handleLoginResponse(result);
    } catch (error: any) {
      this.handleLoginError(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Processes the response from the login API call.
   * @private
   * @param {ApiResponse} response The response from the AuthService.
   */
  private handleLoginResponse(response: ApiResponse): void {
    if (response.success) {
      this.router.navigate(['/videos']);
    } else {
      this.handleLoginError(response);
    }
  }

  /**
   * Handles a failed login attempt by displaying an error message.
   * @private
   * @param {string} [message] The optional error message to display.
   */
  private handleLoginError(error?: any): void {
    this.loginError = error?.message || 'Login failed. Please try again.';
  }

  /**
   * Marks all form fields as touched to display validation errors.
   * @private
   */
  private markAllFieldsAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  // =================================================================
  // Success Message Handling
  // =================================================================

  /**
   * Checks for a 'message' query parameter to display a temporary success notification.
   * @private
   */
  private checkForSuccessMessage(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params: Params) => {
      if (params['message']) {
        this.displaySuccessMessage(params['message']);
      }
    });
  }
  
  /**
   * Displays the success message, cleans the URL, and starts a timer to hide it.
   * @private
   * @param {string} message The message to display.
   */
  private displaySuccessMessage(message: string): void {
    this.successMessage = message;
    this.clearSuccessMessageFromUrl();
    this.startSuccessMessageTimer();
  }

  /**
   * Removes the 'message' query parameter from the URL without reloading the page.
   * @private
   */
  private clearSuccessMessageFromUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { message: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Sets a timeout to clear the success message from the view after 5 seconds.
   * @private
   */
  private startSuccessMessageTimer(): void {
    this.successTimer = window.setTimeout(() => {
      this.successMessage = '';
    }, 5000); // Must match the CSS animation duration.
  }
}