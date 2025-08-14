import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

@Component({
  selector: 'app-main',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Header,
    Footer
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main {
  emailForm: FormGroup;
  signUpAttempted = false; // Tracker für Sign Up Versuche

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.emailForm = this.createEmailForm();
  }

  /**
   * Creates the email form for sign up
   */
  private createEmailForm(): FormGroup {
    return this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]]
    });
  }

  /**
   * Checks if the email field is invalid and should show error
   */
  isEmailInvalid(): boolean {
    const emailField = this.emailForm.get('email');
    // Show error ONLY when sign up was explicitly attempted, ignore touched state
    return !!(emailField && emailField.invalid && this.signUpAttempted);
  }

  /**
   * Dismisses the error message by resetting states
   */
  dismissError(): void {
    this.signUpAttempted = false; // Only reset our custom flag
  }

  /**
   * Handles the sign up form submission
   */
  onSignUp(): void {
    this.signUpAttempted = true; // Mark that sign up was attempted
    
    const emailField = this.emailForm.get('email');
    const emailValue = emailField?.value?.trim();
    
    // Trigger error for empty email or invalid email
    if (!emailValue || this.emailForm.invalid) {
      // Don't mark as touched, just rely on signUpAttempted flag
      return;
    }

    // Reset the flag on successful submission
    this.signUpAttempted = false;
    
    // Navigate to register page with email as query parameter
    this.router.navigate(['/auth/register'], {
      queryParams: { email: emailValue }
    });
  }
}
