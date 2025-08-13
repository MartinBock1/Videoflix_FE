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
   * Checks if the email field is invalid and has been touched
   */
  isEmailInvalid(): boolean {
    const emailField = this.emailForm.get('email');
    return !!(emailField && emailField.invalid && emailField.touched);
  }

  /**
   * Handles the sign up form submission
   */
  onSignUp(): void {
    if (this.emailForm.invalid) {
      this.emailForm.get('email')?.markAsTouched();
      return;
    }

    const email = this.emailForm.get('email')?.value;
    
    // Navigate to register page with email as query parameter
    this.router.navigate(['/auth/register'], {
      queryParams: { email: email }
    });
  }
}
