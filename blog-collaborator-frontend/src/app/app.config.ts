import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api'; // Added

import { routes } from './app.routes';
import { authInterceptor } from './auth/interceptors/auth.interceptor';
import { providePrimeNG } from 'primeng/config';
import lara from '@primeng/themes/lara';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    MessageService, // Added
    providePrimeNG({
      theme: {
        preset: lara,
        options: {
          darkModeSelector: false || 'none',
        },
      },
    }),
  ],
};
