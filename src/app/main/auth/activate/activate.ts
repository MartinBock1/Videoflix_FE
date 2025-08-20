import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Header } from '../../../shared/header/header';
import { Footer } from '../../../shared/footer/footer';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-activate',
  imports: [
    CommonModule,
    RouterModule,
    Header,
    Footer
  ],
  templateUrl: './activate.html',
  styleUrl: './activate.scss'
})
export class Activate implements OnInit {
  isActivating = true;
  activationSuccess = false;
  activationError = false;
  errorMessage = '';
  uid = '';
  token = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get activation parameters from URL query parameters (uid and token)
    this.route.queryParams.subscribe(params => {
      this.uid = params['uid'] || '';
      this.token = params['token'] || '';
      
      if (!this.uid || !this.token) {
        this.handleActivationError('Invalid activation link. Please check your email for the correct link.');
        return;
      }

      // Start activation process
      this.activateAccount();
    });
  }

  /**
   * Handles the account activation process
   */
  private async activateAccount(): Promise<void> {
    try {
      // Use real API call with uid and token
      const response = await firstValueFrom(this.authService.activateAccount(this.uid, this.token));
      
      if (response?.success) {
        this.handleActivationSuccess();
        
        // Redirect to login after successful activation
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2500);
      } else {
        this.handleActivationError(response?.message || 'Activation failed');
      }
    } catch (error: any) {
      this.handleActivationError(error.message || 'An error occurred during activation. Please try again.');
    }
  }

  /**
   * Handles successful activation
   */
  private handleActivationSuccess(): void {
    this.isActivating = false;
    this.activationSuccess = true;
    this.activationError = false;
  }

  /**
   * Handles activation errors
   */
  private handleActivationError(message: string): void {
    this.isActivating = false;
    this.activationSuccess = false;
    this.activationError = true;
    this.errorMessage = message;
  }
}
