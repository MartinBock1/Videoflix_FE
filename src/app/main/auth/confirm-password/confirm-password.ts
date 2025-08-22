// =================================================================
// Standard Angular and RxJS Imports
// =================================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule, Params } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';
import { ApiResponse } from '../../../shared/interfaces/api.interfaces';

/**
 * @Component
 * Defines the metadata for the ConfirmPassword component.
 */
@Component({
  selector: 'app-confirm-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Header,
    Footer
  ],
  templateUrl: './confirm-password.html',
  styleUrl: './confirm-password.scss'
})
export class ConfirmPassword implements OnInit {
  /** 
   * The reactive form group for the password confirmation form. 
   */
  confirmPasswordForm: FormGroup;
  /** 
   * A flag to control the visibility of the password text. 
   */
  showPassword = false;
  /** 
   * A flag to control the visibility of the confirmation password text. 
   */
  showConfirmPassword = false;
  /** 
   * A flag to indicate when the form is being submitted. 
   */
  isSubmitting = false;
  /** 
   * A flag to indicate if the password has been successfully reset. 
   */
  passwordReset = false;
  /** 
   * A string to hold and display any error messages. 
   */
  errorMessage = '';
  /** 
   * The user ID extracted from the URL.
   */
  uid = '';
  /** 
   * The reset token extracted from the URL. 
   */
  token = '';

  /**
   * The constructor for the ConfirmPassword component.
   * @param {FormBuilder} fb - The Angular service for building reactive forms.
   * @param {Router} router - The Angular service for programmatic navigation.
   * @param {ActivatedRoute} route - Service for accessing route parameters.
   * @param {AuthService} authService - Service for handling authentication API calls.
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.confirmPasswordForm = this.createConfirmPasswordForm();
  }

  /**
   * Angular lifecycle hook. Subscribes to query parameters to get reset credentials.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.processResetParams(params);
    });
  }

  /**
   * Extracts and validates the uid and token from the URL query parameters.
   * @private
   * @param {Params} params - The object containing the URL query parameters.
   */
  private processResetParams(params: Params): void {
    this.uid = params['uid'] || '';
    this.token = params['token'] || '';

    if (!this.uid || !this.token) {
      this.errorMessage = 'Invalid reset link. Please request a new password reset.';
    }
  }

  /**
   * Creates and returns the FormGroup for the password confirmation form.
   * @private
   * @returns {FormGroup} The initialized form group with controls and validators.
   */
  private createConfirmPasswordForm(): FormGroup {
    return this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * A custom validator for a FormGroup to check if password fields match.
   * @private
   * @param {AbstractControl} control - The FormGroup instance to validate.
   * @returns {{ passwordMismatch: true } | null} An error object if validation fails, otherwise null.
   */
  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Checks if a specific form field is invalid and should display an error message.
   * @param {string} fieldName - The name of the form control to check.
   * @returns {boolean} True if the field is invalid and should display an error.
   */
 isFieldInvalid(fieldName: string): boolean {
    const field = this.confirmPasswordForm.get(fieldName);
    const hasMismatchError = !!this.confirmPasswordForm.hasError('passwordMismatch');

    if (fieldName === 'confirmPassword') {
      return !!(field && field.touched && (field.invalid || hasMismatchError));
    }
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Toggles the visibility of the password in the password input field.
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles the visibility of the password in the confirm password input field.
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Orchestrates the form submission process.
   */
  async onSubmit(): Promise<void> {
    if (this.confirmPasswordForm.invalid || !this.uid || !this.token) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      await this.performPasswordReset();
    } catch (error: any) {
      this.handleResetError(error.message);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Performs the asynchronous API call to reset the password and handles the response.
   * @private
   */
  private async performPasswordReset(): Promise<void> {
    const { password, confirmPassword } = this.confirmPasswordForm.value;
    const response = await firstValueFrom(
      this.authService.resetPassword(this.uid, this.token, password, confirmPassword)
    );

    if (response?.success) {
      this.handleResetSuccess();
    } else {
      this.handleResetError(response?.message);
    }
  }

  /**
   * Handles the successful password reset case.
   * @private
   */
  private handleResetSuccess(): void {
    this.passwordReset = true;
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2500);
  }

  /**
   * Handles the failed password reset case.
   * @private
   * @param {string} [message] - The optional error message to display.
   */
  private handleResetError(message?: string): void {
    this.errorMessage = message || 'Failed to reset password. Please try again.';
  }

  /**
   * Marks all form fields as touched to trigger the display of validation errors.
   * @private
   */
  private markAllFieldsAsTouched(): void {
    Object.values(this.confirmPasswordForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}