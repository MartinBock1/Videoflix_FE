import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Login } from './main/auth/login/login';
import { Register } from './main/auth/register/register';
import { Activate } from './main/auth/activate/activate';
import { ForgotPassword } from './main/auth/forgot-password/forgot-password';
import { ConfirmPassword } from './main/auth/confirm-password/confirm-password';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  // Landing Page (Öffentlich zugänglich)
  { path: '', component: Main },

  // Auth-Routen (Öffentlich - für nicht eingeloggte Benutzer)
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },
  { path: 'auth/activate', component: Activate },
  { path: 'auth/activate.html', component: Activate },  // Kompatibilität mit Backend Links
  { path: 'auth/forgot-password', component: ForgotPassword },
  { path: 'auth/confirm-password/:token', component: ConfirmPassword },

  // Statische Seiten (Öffentlich)
  // TODO: Privacy und Imprint Komponenten erstellen
  // { path: 'privacy', component: PrivacyComponent },
  // { path: 'imprint', component: ImprintComponent },

  // Geschützte Routen würden hier mit AuthGuard kommen
  // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  // { path: 'videos', component: VideoListComponent, canActivate: [AuthGuard] },
  
  // Fallback - redirect to home
  { path: '**', redirectTo: '' }
];
