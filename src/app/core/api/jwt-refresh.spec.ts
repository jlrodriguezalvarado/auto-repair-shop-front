import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PushNotificationService } from '../push/push-notification.service';
import { environment } from '../../../environments/environment';
import { ENDPOINTS } from './endpoints';

describe('AuthService refresh', () => {
  let auth: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: ToastService, useValue: { success: () => undefined, error: () => undefined } },
        {
          provide: PushNotificationService,
          useValue: {
            registerAfterLogin: async () => undefined,
            unsubscribeOnLogout: async () => undefined,
          },
        },
      ],
    });
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('refreshes access token once for concurrent callers', () => {
    localStorage.setItem('auth_refresh', 'refresh-token');
    const results: string[] = [];
    auth.refreshAccessToken().subscribe((access) => results.push(access));
    auth.refreshAccessToken().subscribe((access) => results.push(access));
    const req = http.expectOne(`${environment.apiUrl}${ENDPOINTS.auth.refresh}`);
    expect(req.request.body).toEqual({ refresh: 'refresh-token' });
    req.flush({ access: 'new-access', refresh: 'new-refresh' });
    expect(results).toEqual(['new-access', 'new-access']);
    expect(localStorage.getItem('auth_token')).toBe('new-access');
    expect(localStorage.getItem('auth_refresh')).toBe('new-refresh');
  });
});
