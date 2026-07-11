import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { mockApiInterceptor } from './core/api/mock-api.interceptor';
import { jwtInterceptor } from './core/api/jwt.interceptor';
import { environment } from '../environments/environment';

const httpInterceptors = environment.useMockApi
  ? [jwtInterceptor, mockApiInterceptor]
  : [jwtInterceptor];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptors(httpInterceptors)),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
