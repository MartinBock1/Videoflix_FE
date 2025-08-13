import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';

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
  confirmPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  passwordReset = false;
  errorMessage = '';
  uid = '';
  token = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.confirmPasswordForm = this.createConfirmPasswordForm();
  }

  ngOnInit(): void {
    // Get reset parameters from URL query parameters (uid and token)
    this.route.queryParams.subscribe(params => {
      console.log('Password reset query parameters:', params); // Debug log
      
      this.uid = params['uid'] || '';
      this.token = params['token'] || '';
      
      console.log('UID:', this.uid, 'Token:', this.token); // Debug log
      
      if (!this.uid || !this.token) {
        this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      }
    });
  }

  /**
   * Creates the reactive confirm password form with validation
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
   * Custom validator to check if passwords match
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
   * Checks if a form field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.confirmPasswordForm.get(fieldName);
    if (fieldName === 'confirmPassword') {
      return !!(field && field.invalid && field.touched) || 
             !!(this.confirmPasswordForm.hasError('passwordMismatch') && field?.touched);
    }
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Toggles password visibility
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggles confirm password visibility
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handles form submission
   */
  async onSubmit(): Promise<void> {
    if (this.confirmPasswordForm.invalid || !this.uid || !this.token) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const { password, confirmPassword } = this.confirmPasswordForm.value;
      
      const response = await firstValueFrom(this.authService.resetPassword(this.uid, this.token, password, confirmPassword));
      
      if (response?.success) {
        // Mark password as reset
        this.passwordReset = true;
        
        // Redirect to login after successful reset
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2500);
      } else {
        this.errorMessage = response?.message || 'Failed to reset password. Please try again.';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to reset password. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Marks all form fields as touched to trigger validation display
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.confirmPasswordForm.controls).forEach(key => {
      this.confirmPasswordForm.get(key)?.markAsTouched();
    });
  }
}
