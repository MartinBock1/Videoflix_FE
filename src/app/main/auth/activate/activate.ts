// =================================================================
// Standard Angular and RxJS Imports
// =================================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
 * Defines the metadata for the Activate component.
 */
@Component({
  selector: 'app-activate',
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './activate.html',
  styleUrl: './activate.scss',
})
export class Activate implements OnInit {
  /**
   * A flag to indicate that the activation process is in progress.
   */
  isActivating = true;
  /**
   * A flag to indicate that the account was successfully activated.
   */
  activationSuccess = false;
  /**
   * A flag to indicate that an error occurred during activation.
   */
  activationError = false;
  /**
   * A string to hold and display any error messages to the user.
   */
  errorMessage = '';
  /**
   * The user ID extracted from the URL.
   */
  uid = '';
  /**
   * The activation token extracted from the URL.
   */
  token = '';

  /**
   * The constructor for the Activate component.
   * @param {Router} router - The Angular service for programmatic navigation.
   * @param {ActivatedRoute} route - Service for accessing route parameters.
   * @param {AuthService} authService - Service for handling authentication API calls.
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  /**
   * Angular lifecycle hook. Subscribes to query parameters to start the activation.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.processActivationParams(params);
    });
  }

  /**
   * Extracts and validates the uid and token from the URL query parameters.
   * @private
   * @param {Params} params - The object containing the URL query parameters.
   */
  private processActivationParams(params: Params): void {
    this.uid = params['uid'] || '';
    this.token = params['token'] || '';

    if (!this.uid || !this.token) {
      const message = 'Invalid activation link. Please check your email for the correct link.';
      this.handleActivationError(message);
      return;
    }
    this.activateAccount();
  }

  /**
   * Performs the asynchronous API call to activate the account.
   * @private
   */
  private async activateAccount(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.authService.activateAccount(this.uid, this.token)
      );
      this.handleActivationResponse(response);
    } catch (error: any) {
      const message = error.message || 'An error occurred during activation. Please try again.';
      this.handleActivationError(message);
    }
  }

  /**
   * Processes the response from the activation API call.
   * @private
   * @param {ApiResponse} response - The response object from the AuthService.
   */
  private handleActivationResponse(response: ApiResponse): void {
    if (response?.success) {
      this.handleActivationSuccess();
      this.redirectToLoginAfterDelay();
    } else {
      this.handleActivationError(response?.message || 'Activation failed');
    }
  }

  /**
   * Navigates the user to the login page after a short delay.
   * @private
   */
  private redirectToLoginAfterDelay(): void {
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2500);
  }

  /**
   * Updates the component's state to reflect a successful activation.
   * @private
   */
  private handleActivationSuccess(): void {
    this.isActivating = false;
    this.activationSuccess = true;
    this.activationError = false;
  }

  /**
   * Updates the component's state to reflect a failed activation.
   * @private
   * @param {string} message - The error message to display to the user.
   */
  private handleActivationError(message: string): void {
    this.isActivating = false;
    this.activationSuccess = false;
    this.activationError = true;
    this.errorMessage = message;
  }
}