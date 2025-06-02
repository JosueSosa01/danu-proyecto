// src/app/app.config.ts
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';




export const appConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient()
  ]
};
