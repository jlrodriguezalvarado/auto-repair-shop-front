import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../api/api.service';
import { ENDPOINTS } from '../api/endpoints';
import { User, UserRole, CompanyBrief } from '../api/models';
import { ToastService } from '../../shared/services/toast.service';
import { PushNotificationService } from '../push/push-notification.service';
import { Observable, of, throwError, shareReplay } from 'rxjs';
import { tap, catchError, switchMap, map, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { keysToCamel } from '../api/case-mapper';

interface LoginResponse {
  access: string;
  refresh?: string;
  user?: User;
}

interface RefreshResponse {
  access: string;
  refresh?: string;
}

const VIEWING_COMPANY_KEY = 'auth_viewing_company';
const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_REFRESH_KEY = 'auth_refresh';
const AUTH_USER_KEY = 'auth_user';

function extractAuthErrorCode(err: unknown): string | null {
  if (!(err instanceof HttpErrorResponse) || !err.error || typeof err.error !== 'object') {
    return null;
  }
  const body = err.error as Record<string, unknown>;
  if (typeof body['code'] === 'string') {
    return body['code'];
  }
  const detail = body['detail'];
  if (detail && typeof detail === 'object' && typeof (detail as Record<string, unknown>)['code'] === 'string') {
    return (detail as Record<string, unknown>)['code'] as string;
  }
  if (typeof detail === 'string') {
    if (detail.toLowerCase().includes('account has been deleted')) {
      return 'user_deleted';
    }
    if (detail.toLowerCase().includes('company is unavailable')) {
      return 'company_deleted';
    }
  }
  return null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  private push = inject(PushNotificationService);
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);
  private viewingCompanySignal = signal<CompanyBrief | null>(null);
  private refreshInFlight$: Observable<string> | null = null;
  readonly user = this.currentUser.asReadonly();
  readonly jwtToken = this.token.asReadonly();
  readonly viewingCompany = this.viewingCompanySignal.asReadonly();
  readonly isReadOnlyCompanyView = computed(
    () => this.currentUser()?.role === 'SUPER_ADMIN' && this.viewingCompanySignal() !== null
  );
  readonly canMutateTenantData = computed(() => !this.isReadOnlyCompanyView());

  constructor() {
    this.restoreSession();
  }

  login(username: string, password: string): Observable<User> {
    return this.api.post<LoginResponse>(ENDPOINTS.auth.login, { username, password }).pipe(
      switchMap((res) => {
        this.clearViewingCompany();
        this.setAccessToken(res.access);
        if (res.refresh) {
          localStorage.setItem(AUTH_REFRESH_KEY, res.refresh);
        }
        if (res.user) {
          return of(res.user);
        }
        return this.api.get<User>(ENDPOINTS.auth.me);
      }),
      tap((user) => {
        this.clearViewingCompany();
        this.setUser(user);
        this.toast.success(`¡Bienvenido de vuelta, ${user.username}!`);
        void this.push.registerAfterLogin();
      }),
      catchError((err) => {
        this.clearSessionStorage();
        const code = extractAuthErrorCode(err);
        if (code === 'user_deleted') {
          this.toast.error('Esta cuenta ha sido eliminada.');
        } else if (code === 'company_deleted') {
          this.toast.error('Su empresa no está disponible. Contacte al administrador.');
        } else {
          this.toast.error('Nombre de usuario o contraseña incorrectos.');
        }
        return throwError(() => err);
      })
    );
  }

  /** Shared refresh for concurrent 401s. Uses HttpClient directly (no ApiService case map). */
  refreshAccessToken(): Observable<string> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }
    const refresh = localStorage.getItem(AUTH_REFRESH_KEY);
    if (!refresh) {
      return throwError(() => new Error('No refresh token'));
    }
    this.refreshInFlight$ = this.http
      .post<RefreshResponse>(`${environment.apiUrl}${ENDPOINTS.auth.refresh}`, { refresh })
      .pipe(
        map((res) => {
          const body = (keysToCamel(res) ?? res) as RefreshResponse;
          this.setAccessToken(body.access);
          if (body.refresh) {
            localStorage.setItem(AUTH_REFRESH_KEY, body.refresh);
          }
          return body.access;
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    return this.refreshInFlight$;
  }

  changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Observable<{ detail: string }> {
    return this.api.post<{ detail: string }>(ENDPOINTS.auth.changePassword, payload);
  }

  enterCompanyView(company: CompanyBrief | { id: number; name: string }): void {
    const brief: CompanyBrief = { id: company.id, name: company.name };
    this.viewingCompanySignal.set(brief);
    localStorage.setItem(VIEWING_COMPANY_KEY, JSON.stringify(brief));
    this.router.navigate(['/dashboard']);
  }

  exitCompanyView(): void {
    this.clearViewingCompany();
    this.router.navigate(['/companies']);
  }

  async logout(): Promise<void> {
    try {
      await this.push.unsubscribeOnLogout(true);
    } catch {
      // ignore push cleanup errors on logout
    }
    this.clearSessionStorage();
    this.router.navigate(['/login']);
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  homePath(): string {
    if (!this.currentUser()) {
      return '/login';
    }
    if (this.isReadOnlyCompanyView()) {
      return '/dashboard';
    }
    return this.hasRole(['SUPER_ADMIN']) ? '/companies' : '/dashboard';
  }

  private restoreSession(): void {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    if (!savedToken || !savedUser) {
      return;
    }
    try {
      const parsedUser = JSON.parse(savedUser) as User;
      this.token.set(savedToken);
      this.currentUser.set(parsedUser);
      this.restoreViewingCompany(parsedUser);
    } catch {
      this.clearSessionStorage();
      return;
    }
    this.api.get<User>(ENDPOINTS.auth.me).subscribe({
      next: (user) => {
        this.setUser(user);
        this.restoreViewingCompany(user);
      },
      error: () => {
        // jwtInterceptor refreshes or logs out on 401
      },
    });
  }

  private setAccessToken(access: string): void {
    this.token.set(access);
    localStorage.setItem(AUTH_TOKEN_KEY, access);
  }

  private setUser(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  private clearSessionStorage(): void {
    this.clearViewingCompany();
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  private clearViewingCompany(): void {
    this.viewingCompanySignal.set(null);
    localStorage.removeItem(VIEWING_COMPANY_KEY);
  }

  private restoreViewingCompany(user: User): void {
    if (user.role !== 'SUPER_ADMIN') {
      this.clearViewingCompany();
      return;
    }
    const raw = localStorage.getItem(VIEWING_COMPANY_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as CompanyBrief;
      if (typeof parsed?.id === 'number' && typeof parsed?.name === 'string') {
        this.viewingCompanySignal.set({ id: parsed.id, name: parsed.name });
        return;
      }
    } catch {
      // ignore invalid storage
    }
    this.clearViewingCompany();
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.user()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.user()) {
    return true;
  }
  router.navigateByUrl(auth.homePath());
  return false;
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.user() && auth.hasRole(allowedRoles)) {
      return true;
    }
    if (
      auth.user() &&
      auth.isReadOnlyCompanyView() &&
      (allowedRoles.includes('ADMIN') || allowedRoles.includes('SECRETARY'))
    ) {
      return true;
    }
    router.navigateByUrl(auth.homePath());
    return false;
  };
};
