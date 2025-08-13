import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Header,
    Footer
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadEmailFromQuery();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      privacyPolicy: [false, [Validators.requiredTrue]]
    }, { 
      validators: this.passwordsMatchValidator 
    });
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

  // Custom validator to check if passwords match
  private passwordsMatchValidator(group: FormGroup): any {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Check if a field is invalid and has been touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    if (fieldName === 'confirmPassword') {
      return !!(field && field.invalid && field.touched) || 
             !!(this.registerForm.hasError('passwordMismatch') && field?.touched);
    }
    return !!(field && field.invalid && field.touched);
  }

  // Toggle password visibility
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // Toggle confirm password visibility
  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      
      const { email, password, confirmPassword } = this.registerForm.value;
      
      const registerData = {
        email,
        password,
        confirmed_password: confirmPassword
      };
      
      // Real API call to backend
      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.isSubmitting = false;
          this.router.navigate(['/auth/login'], {
            queryParams: { message: 'Registration successful! Please check your email for activation.' }
          });
        },
        error: (error) => {
          console.error('Registration failed:', error);
          // TODO: Show error message to user
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.registerForm.markAllAsTouched();
    }
  }
}
