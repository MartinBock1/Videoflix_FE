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
import { VideoListComponent } from './pages/video-list/video-list.component';

export const routes: Routes = [
  // Landing Page (Öffentlich zugänglich)
  { path: '', component: Main },

  // Auth-Routen (Öffentlich - für nicht eingeloggte Benutzer)
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },
  { path: 'auth/activate', component: Activate },
  { path: 'auth/activate.html', component: Activate },
  { path: 'auth/forgot-password', component: ForgotPassword },
  { path: 'auth/forgot_password.html', component: ForgotPassword },  // Backend verwendet Unterstrich!
  { path: 'auth/confirm-password', component: ConfirmPassword },
  { path: 'auth/confirm-password.html', component: ConfirmPassword },
  { path: 'auth/confirm_password.html', component: ConfirmPassword },  // Backend verwendet Unterstrich!

  // Statische Seiten (Öffentlich)
  { path: 'privacy', component: Privacy },
  { path: 'imprint', component: Imprint },

  // Geschützte Routen würden hier mit AuthGuard kommen
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'videos', component: VideoListComponent, canActivate: [AuthGuard] },
  
  // Fallback - redirect to home
  { path: '**', redirectTo: '' }
];
