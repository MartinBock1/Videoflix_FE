import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';
import { lastValueFrom } from 'rxjs';

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
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  emailSent = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.createForgotPasswordForm();
  }

  /**
   * Creates the reactive forgot password form with validation
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
   * Checks if a form field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Handles form submission
   */
  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const { email } = this.forgotPasswordForm.value;
      
      await lastValueFrom(this.authService.forgotPassword(email));
      
      // Mark email as sent
      this.emailSent = true;

      // Navigate to login page after successful email sending
      this.router.navigate(['/auth/login'], {
        queryParams: { 
          message: 'Password reset email sent! Please check your inbox.' 
        }
      });
      
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to send reset email. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Marks all form fields as touched to trigger validation display
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      this.forgotPasswordForm.get(key)?.markAsTouched();
    });
  }
}
