import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Login } from './main/auth/login/login';
import { Register } from './main/auth/register/register';
import { Activate } from './main/auth/activate/activate';
import { ForgotPassword } from './main/auth/forgot-password/forgot-password';
import { ConfirmPassword } from './main/auth/confirm-password/confirm-password';
import { Privacy } from './shared/privacy/privacy';
import { Imprint } from './shared/imprint/imprint';
import { AuthGuard } from './shared/guards/auth.guard';
import { VideoList } from './pages/video-list/video-list';

/**
 * @const {Routes} routes
 *
 * @description
 * Defines the routing configuration for the entire application. This array of route
 * objects maps URL paths to their corresponding Angular components. It also specifies
 * route guards (`canActivate`) to protect certain routes from unauthorized access.
 */
export const routes: Routes = [
  // =================================================================
  // Publicly Accessible Routes
  // =================================================================

  // The main landing page of the application.
  { path: '', component: Main },

   // Authentication-related routes, accessible to unauthenticated users./
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },
  { path: 'auth/activate', component: Activate },
  // Legacy route to support links from backend emails.
  { path: 'auth/activate.html', component: Activate },
  { path: 'auth/forgot-password', component: ForgotPassword },
  // Legacy route for password reset, as the backend may use underscores.
  { path: 'auth/forgot_password.html', component: ForgotPassword },
  { path: 'auth/confirm-password', component: ConfirmPassword },
  // Legacy routes for password confirmation.
  { path: 'auth/confirm-password.html', component: ConfirmPassword },
  { path: 'auth/confirm_password.html', component: ConfirmPassword },

  // Static informational pages.
  { path: 'privacy', component: Privacy },
  { path: 'imprint', component: Imprint },

  // =================================================================
  // Protected Routes (Require Authentication)
  // =================================================================
  // The main video listing page, accessible only to authenticated users.
  {
    path: 'videos',
    component: VideoList,
    canActivate: [AuthGuard],
  },

  // =================================================================
  // Wildcard / Fallback Route
  // =================================================================
  // wildcard route that matches any path not defined above
  { path: '**', redirectTo: '' },
];
