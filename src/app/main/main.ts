// =================================================================
// Standard Angular Imports
// =================================================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

// =================================================================
// Custom Application-Specific Imports
// =================================================================
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

/**
 * @Component
 * Defines the metadata for the Main component.
 */
@Component({
  selector: 'app-main',
  imports: [CommonModule, ReactiveFormsModule, Header, Footer],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {
  /**
   * The reactive form group for the email sign-up form.
   * @type {FormGroup}
   */
  emailForm: FormGroup;

  /**
   * A boolean flag to track if the user has attempted to submit the sign-up form.
   * This is used to control when validation error messages are displayed, improving UX
   * by not showing errors prematurely.
   * @type {boolean}
   */
  signUpAttempted = false;

  /**
   * The constructor for the Main component.
   * @param {FormBuilder} fb - The Angular service for building reactive forms.
   * @param {Router} router - The Angular service for programmatic navigation.
   */
  constructor(private fb: FormBuilder, private router: Router) {
    this.emailForm = this.createEmailForm();
  }

  /**
   * Creates and returns the FormGroup for the email sign-up form.
   * @private
   * @returns {FormGroup} The initialized form group with an 'email' control and validators.
   */
  private createEmailForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Checks if the email form field is invalid and if a submission has been attempted.
   * This logic determines whether to show a validation error message in the template.
   * @returns {boolean} True if an error should be displayed, otherwise false.
   */
  isEmailInvalid(): boolean {
    const emailField = this.emailForm.get('email');
    // Show error ONLY when sign up was explicitly attempted, ignore touched state
    return !!(emailField && emailField.invalid && this.signUpAttempted);
  }

  /**
   * Resets the sign-up attempt flag, effectively dismissing any visible error messages.
   * This is typically called by a "close" button on the error message itself.
   * @returns {void}
   */
  dismissError(): void {
    this.signUpAttempted = false; // Only reset our custom flag
  }

  /**
   * Handles the submission of the email sign-up form.
   *
   * It first validates the form. If valid, it navigates the user to the registration
   * page, passing the entered email as a query parameter. If invalid, it sets a flag
   * to display the validation error.
   *
   * @returns {void}
   */
  onSignUp(): void {
    this.signUpAttempted = true;

    const emailField = this.emailForm.get('email');
    const emailValue = emailField?.value?.trim();
    if (!emailValue || this.emailForm.invalid) {
      return;
    }

    this.signUpAttempted = false;
    this.router.navigate(['/auth/register'], {
      queryParams: { email: emailValue },
    });
  }
}