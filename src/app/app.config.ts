import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideAnimationsAsync(),
    MessageService,
    ConfirmDialog,
    providePrimeNG({
      theme: {
        preset: Aura,
        options:{
          darkModeSelector: '.dark-mode',
        }
      },
    }),
  ],
};
