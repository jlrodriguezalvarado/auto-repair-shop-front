import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService, roleGuard } from '../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PushNotificationService } from '../push/push-notification.service';
import { User } from './models';

describe('roleGuard', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideRouter([
          { path: 'dashboard', children: [] },
          { path: 'login', children: [] },
        ]),
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
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
  });

  afterEach(() => localStorage.clear());

  function setUser(role: User['role']): void {
    (auth as unknown as { currentUser: { set: (u: User) => void } }).currentUser.set({
      id: 1,
      username: 'tester',
      email: 't@example.com',
      role,
      company: role === 'SUPER_ADMIN' ? null : { id: 1, name: 'Shop' },
    });
  }

  it('allows ADMIN on customers route roles', () => {
    setUser('ADMIN');
    const guard = roleGuard(['ADMIN', 'SECRETARY']);
    expect(TestBed.runInInjectionContext(() => guard({} as never, {} as never))).toBe(true);
  });

  it('blocks MECHANIC from customers route roles', () => {
    setUser('MECHANIC');
    const guard = roleGuard(['ADMIN', 'SECRETARY']);
    expect(TestBed.runInInjectionContext(() => guard({} as never, {} as never))).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});
