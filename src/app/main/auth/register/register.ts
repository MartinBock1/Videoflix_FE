// =================================================================
// Standard Angular and RxJS Imports
// =================================================================
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService, RegisterData } from '../../../shared/services/auth.service';

/**
 * @Component
 * Defines the metadata for the Register component.
 */
@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Header, Footer],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit, OnDestroy {
  /**
   * The reactive form group that manages the registration form's state and validation.
   * The `!` non-null assertion operator indicates that this property will be initialized in `ngOnInit`.
   * @type {FormGroup}
   */
  registerForm!: FormGroup;
  /**
   * A boolean flag to control the visibility of the password text in the main password field.
   * @type {boolean}
   * @default false
   */
  showPassword = false;
  /**
   * A boolean flag to control the visibility of the password text in the confirm password field.
   * @type {boolean}
   * @default false
   */
  showConfirmPassword = false;
  /**
   * A boolean flag to indicate when the form is being submitted to the server.
   * Used to disable the submit button and show a loading state to prevent multiple submissions.
   * @type {boolean}
   * @default false
   */
  isSubmitting = false;
  /**
   * A string to hold any error messages returned from the backend or from client-side validation logic.
   * This message is displayed to the user.
   * @type {string}
   * @default ''
   */
  errorMessage = '';

  /**
   * Holds the subscription to the form's `valueChanges` observable.
   * This is used to automatically clear the `errorMessage` when the user starts typing.
   * It is unsubscribed in `ngOnDestroy` to prevent memory leaks.
   * @private
   * @type {Subscription | undefined}
   */
  private formChangesSubscription?: Subscription;

  /**
   * The constructor for the Register component.
   *
   * It injects the necessary services for form creation, authentication, and routing.
   *
   * @param {FormBuilder} fb - The Angular service for building reactive forms.
   * @param {AuthService} authService - The custom service for handling authentication API calls.
   * @param {Router} router - The Angular service for programmatic navigation.
   * @param {ActivatedRoute} route - The Angular service providing access to information about the current route.
   */
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // =================================================================
  // Lifecycle Hooks
  // =================================================================

  /**
   * Angular lifecycle hook. Initializes the form and its listeners.
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadEmailFromQuery();
    this.setupFormListeners();
  }

  /**
   * Angular lifecycle hook. Cleans up subscriptions to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  // =================================================================
  // Form Setup and Validation
  // =================================================================

  /**
   * Initializes the `registerForm` with its controls and validators.
   * @private
   */
  private initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        privacyPolicy: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordsMatchValidator,
      }
    );
  }

  /**
   * Subscribes to form value changes to clear the error message on user input.
   * @private
   */
  private setupFormListeners(): void {
    this.formChangesSubscription = this.registerForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  /**
   * Pre-populates the email field if an 'email' query parameter is present in the URL.
   * @private
   */
  private loadEmailFromQuery(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.registerForm.patchValue({ email: email });
    }
  }

  /**
   * A custom validator to check if 'password' and 'confirmPassword' fields match.
   * @private
   * @param {AbstractControl} group The FormGroup to validate.
   * @returns An error object if validation fails, otherwise null.
   */
  private passwordsMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Checks if a form field is invalid and should display an error.
   * @param {string} fieldName The name of the form control to check.
   * @returns {boolean} True if an error should be displayed.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    const hasMismatchError = !!this.registerForm.hasError('passwordMismatch');

    if (fieldName === 'confirmPassword') {
      return !!(field && field.touched && (field.invalid || hasMismatchError));
    }
    return !!(field && field.invalid && field.touched);
  }

  // =================================================================
  // UI Interaction Methods
  // =================================================================

  /** 
   * Toggles the visibility of the password in the password input field. 
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles the visibility of the password in the confirm password input field.
   *
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // =================================================================
  // Form Submission
  // =================================================================

  /**
   * Orchestrates the form submission process.
   * Validates the form and delegates to the registration handler if valid.
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.performRegistration();
  }

  /**
   * Handles the core logic of the registration API request.
   * @private
   */
  private performRegistration(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    const registerData = this.prepareRegistrationData();

    this.authService.register(registerData).subscribe({
      next: () => this.handleRegistrationSuccess(),
      error: (error) => this.handleRegistrationError(error),
    });
  }
  
  /**
   * Prepares the data payload for the registration API call.
   * @private
   * @returns {RegisterData} The data object for the registration request.
   */
  private prepareRegistrationData(): RegisterData {
    const { email, password, confirmPassword } = this.registerForm.value;
    return {
      email,
      password,
      confirmed_password: confirmPassword,
    };
  }

  /**
   * Handles the successful response from the registration endpoint.
   * @private
   */
  private handleRegistrationSuccess(): void {
    this.isSubmitting = false;
    this.navigateToLoginWithMessage();
  }

  /**
   * Handles an error during the registration process.
   * @private
   * @param {any} error The error object returned from the service.
   */
  private handleRegistrationError(error: any): void {
    this.errorMessage = error.message || 'Registration failed. Please try again.';
    this.isSubmitting = false;
  }
  
  /**
   * Navigates the user to the login page with a success message.
   * @private
   */
  private navigateToLoginWithMessage(): void {
    this.router.navigate(['/auth/login'], {
      queryParams: {
        message: 'Registration successful! Please check your email for activation.',
      },
    });
  }

  /**
   * Marks all form fields as touched to display validation errors.
   * @private
   */
  private markAllFieldsAsTouched(): void {
    Object.values(this.registerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}