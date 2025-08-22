// =================================================================
// Standard Angular and RxJS Imports
// =================================================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';

/**
 * @Component
 * Defines the metadata for the ForgotPassword component.
 */
@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Header,
    Footer
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  /** 
   * The reactive form group for the forgot password form. 
   */
  forgotPasswordForm: FormGroup;
  /** 
   * A flag to indicate when the form is being submitted. 
   */
  isSubmitting = false;
  /** 
   * A flag to indicate if the password reset email has been successfully sent. 
   */
  emailSent = false;
  /** 
   * A string to hold and display any error messages. 
   */
  errorMessage = '';

  /**
   * The constructor for the ForgotPassword component.
   * @param {FormBuilder} fb - The Angular service for building reactive forms.
   * @param {Router} router - The Angular service for programmatic navigation.
   * @param {AuthService} authService - Service for handling authentication API calls.
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.createForgotPasswordForm();
  }

  /**
   * Creates and returns the FormGroup for the forgot password form.
   * @private
   * @returns {FormGroup} The initialized form group with an 'email' control and validators.
   */
  private createForgotPasswordForm(): FormGroup {
    return this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  /**
   * Checks if the email form field is invalid and has been touched.
   * @param {string} fieldName - The name of the form control to check (always 'email' in this case).
   * @returns {boolean} True if an error should be displayed, otherwise false.
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

/**
   * Orchestrates the form submission process.
   * Validates the form and, if valid, initiates the password reset request.
   */
  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }
    await this.performResetRequest();
  }

  /**
   * Handles the core logic of the API request for the password reset.
   * Sets loading states and calls success or error handlers based on the API response.
   * @private
   */
  private async performResetRequest(): Promise<void> {
    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const { email } = this.forgotPasswordForm.value;
      await lastValueFrom(this.authService.forgotPassword(email));
      this.handleSuccess();
    } catch (error: any) {
      this.handleError(error.message);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Handles the successful response from the password reset request.
   * Updates the component state and navigates the user to the login page.
   * @private
   */
  private handleSuccess(): void {
    this.emailSent = true;
    this.navigateToLoginWithMessage();
  }

  /**
   * Handles an error response from the password reset request.
   * @private
   * @param {string} [message] - The optional error message to display.
   */
  private handleError(message?: string): void {
    this.errorMessage = message || 'Failed to send reset email. Please try again.';
  }

  /**
   * Navigates the user to the login page with a success message in the query parameters.
   * @private
   */
  private navigateToLoginWithMessage(): void {
    const message = 'Password reset email sent! Please check your inbox.';
    this.router.navigate(['/auth/login'], { queryParams: { message } });
  }

  /**
   * Marks all form fields as touched to trigger the display of validation errors.
   * @private
   */
  private markAllFieldsAsTouched(): void {
    Object.values(this.forgotPasswordForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
