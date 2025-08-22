import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';

/**
 * @Component
 * Defines the metadata for the Register component.
 * - `selector`: The custom HTML tag for this component.
 * - `imports`: Lists the standalone dependencies required by the component's template.
 * - `templateUrl`: The path to the component's HTML template.
 * - `styleUrl`: The path to the component's SCSS stylesheet.
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

  /**
   * An Angular lifecycle hook that runs after the component has been initialized.
   *
   * This method orchestrates the initial setup of the component. It first calls `initializeForm`
   * to create the reactive form structure and its validators. It then attempts to pre-populate the
   * email field by calling `loadEmailFromQuery`. Finally, it subscribes to the form's `valueChanges`
   * observable to clear any existing error messages as soon as the user starts modifying the form,
   * improving the user experience.
   *
   * @override
   * @returns {void}
   */
  ngOnInit(): void {
    this.initializeForm();
    this.loadEmailFromQuery();
    this.formChangesSubscription = this.registerForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  /**
   * An Angular lifecycle hook that runs just before the component is destroyed.
   *
   * This method handles cleanup to prevent memory leaks. It checks for the existence of the
   * `formChangesSubscription` and, if it exists, unsubscribes from it. This is a crucial
   * best practice for managing subscriptions in Angular components.
   *
   * @override
   * @returns {void}
   */
  ngOnDestroy(): void {
    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  /**
   * Initializes the `registerForm` with its controls, initial values, and validation rules.
   *
   * This private helper method uses the Angular `FormBuilder` to create a `FormGroup`.
   * It defines the form controls for 'email', 'password', 'confirmPassword', and 'privacyPolicy',
   * each with specific validators (e.g., required, email format, minLength).
   * It also applies a custom cross-field validator, `passwordsMatchValidator`, at the group level
   * to ensure that the password and confirm password fields match.
   *
   * @private
   * @returns {void}
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
   * Load email from query parameters and set it in the form
   */
  private loadEmailFromQuery(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.registerForm.patchValue({ email: email });
    }
  }

  /**
   * A custom validator function for a FormGroup to check if the 'password' and 'confirmPassword' fields match.
   *
   * This validator is applied at the FormGroup level to perform cross-field validation.
   * It retrieves the 'password' and 'confirmPassword' controls from the group. If the values of these
   * controls are not identical, it returns an error object `{ passwordMismatch: true }`.
   * Otherwise, it returns `null`, indicating that the validation has passed.
   *
   * @private
   * @param {FormGroup} group - The FormGroup instance to validate.
   * @returns {{ passwordMismatch: true } | null} An error object if validation fails, otherwise null.
   */
  private passwordsMatchValidator(group: FormGroup): any {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  /**
   * Checks if a specific form field is invalid and should display an error message.
   *
   * A field is considered invalid for display if it fails its validation rules (`invalid`)
   * and the user has interacted with it (`touched`).
   *
   * For the 'confirmPassword' field, it includes an additional check to see if the
   * `passwordMismatch` error is present on the parent form group, ensuring the error
   * message is shown as soon as the passwords don't match and the field has been touched.
   *
   * @param {string} fieldName - The name of the form control to check.
   * @returns {boolean} True if the field is invalid and should display an error, otherwise false.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    if (fieldName === 'confirmPassword') {
      return (
        !!(field && field.invalid && field.touched) ||
        !!(this.registerForm.hasError('passwordMismatch') && field?.touched)
      );
    }
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Toggles the visibility of the password in the password input field.
   *
   * This method flips the boolean value of the `showPassword` property,
   * which is used in the template to switch the input's `type` attribute
   * between 'password' and 'text'.
   *
   * @returns {void}
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles the visibility of the password in the confirm password input field.
   *
   * This method flips the boolean value of the `showConfirmPassword` property,
   * which is used in the template to switch the input's `type` attribute
   * between 'password' and 'text'.
   *
   * @returns {void}
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handles the submission of the registration form.
   *
   * This method first checks if the form is valid according to the defined validators.
   * If valid, it sets the `isSubmitting` flag to true to provide visual feedback (e.g., disabling the submit button).
   * It then constructs the registration data payload and calls the `authService.register` method.
   *
   * On a successful API response, it resets the submission flag and navigates the user to the login page,
   * passing a success message as a query parameter.
   *
   * On an error response, it captures the error message, displays it to the user, and resets the submission flag.
   *
   * If the form is invalid upon submission, it marks all form fields as 'touched' to trigger the display
   * of validation error messages to the user.
   *
   * @returns {void}
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;

      const { email, password, confirmPassword } = this.registerForm.value;

      const registerData = {
        email,
        password,
        confirmed_password: confirmPassword,
      };

      // Real API call to backend
      this.authService.register(registerData).subscribe({
        /**
         * Handles the successful response from the registration endpoint.
         * @param response - The API response on success.
         */
        next: (response) => {
          this.isSubmitting = false;
          this.router.navigate(['/auth/login'], {
            queryParams: {
              message:
                'Registration successful! Please check your email for activation.',
            },
          });
        },
        /**
         * Handles any errors that occur during the registration process.
         * @param error - The error object returned from the service.
         */
        error: (error) => {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
          this.isSubmitting = false;
        },
        /**
         * Optional: clean up logic that runs after the observable completes.
         */
        complete: () => {
          this.isSubmitting = false;
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.registerForm.markAllAsTouched();
    }
  }
}
