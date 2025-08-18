import { Component, OnInit, OnDestroy } from '@angular/core'; // OnInit importieren
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Header, Footer],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  // OnInit implementieren
  loginForm: FormGroup;
  showPassword = false;
  isSubmitting = false;
  loginError = '';
  successMessage = '';

  private queryParamsSubscription?: Subscription;
  private successTimer?: number;
  private formChangesSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.createLoginForm();
  }
  
  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Used to check for success messages and set up form value changes.
   */
  ngOnInit(): void {
    this.checkForSuccessMessage();

    // Clear login error when user starts typing
     this.formChangesSubscription = this.loginForm.valueChanges.subscribe(() => {
      if (this.loginError) {
        this.loginError = '';
      }
    });
  }

  /**
   * Creates the reactive login form with validation
   */
  private createLoginForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  /**
   * Checks if a form field is invalid and has been touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Toggles password visibility
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handles form submission
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginError = '';

    try {
      const { email, password } = this.loginForm.value;
      await lastValueFrom(this.authService.login(email, password));
      this.router.navigate(['/']);
    } catch (error: any) {
      this.loginError = error.message || 'Login failed. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Marks all form fields as touched to trigger validation display
   */
  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Checks for a success message from query parameters and displays it.
   * The message automatically fades out and is removed.
   */
  private checkForSuccessMessage(): void {
    this.route.queryParams.pipe(take(1)).subscribe((params) => {
      if (params['message']) {
        this.successMessage = params['message'];

        // URL sofort bereinigen
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { message: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });

        // EINZIGER Timer: Entfernt die Nachricht aus dem DOM, nachdem die
        // 5-sekündige CSS-Animation beendet ist.
        this.successTimer = window.setTimeout(() => {
          this.successMessage = '';
        }, 5000); // Muss exakt mit der Dauer der CSS-Animation übereinstimmen
      }
    });
  }

  ngOnDestroy(): void {
    // Bereinigt den Timer, falls der Nutzer die Seite vorher verlässt
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    if (this.formChangesSubscription) {
      this.formChangesSubscription.unsubscribe();
    }
  }

  /**
   * Dismiss success message manually
   */
  // dismissSuccessMessage(): void {
  //   this.successMessage = '';
  //   this.isFadingOut = false;

  //   if (this.successTimer) {
  //     clearTimeout(this.successTimer);
  //     this.successTimer = undefined;
  //   }
  // }
}
