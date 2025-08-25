import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { routes } from './app.routes';

/**
 * @const {ApplicationConfig} appConfig
 *
 * @description
 * The main configuration object for the Angular application, defining the root providers
 * for essential services and features. This setup is used for bootstrapping the standalone
 * application.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),    
  ],
};
