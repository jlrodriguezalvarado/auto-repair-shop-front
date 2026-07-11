import { Injectable, inject, signal } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../api/api.service';
import { ENDPOINTS } from '../api/endpoints';
import { User } from '../api/models';
import { ToastService } from '../../shared/services/toast.service';
import { Observable, switchMap, tap, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly jwtToken = this.token.asReadonly();

  constructor() {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(username: string, password: string): Observable<User> {
    return this.api.post<{ access: string; refresh: string }>(ENDPOINTS.auth.login, { username, password }).pipe(
      tap(res => {
        this.token.set(res.access);
        localStorage.setItem('auth_token', res.access);
        localStorage.setItem('auth_refresh', res.refresh);
      }),
      switchMap(() => this.fetchCurrentUser()),
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('auth_user', JSON.stringify(user));
        this.toast.success(`¡Bienvenido de vuelta, ${user.username}!`);
      }),
      catchError(err => {
        this.toast.error('Nombre de usuario o contraseña incorrectos.');
        throw err;
      })
    );
  }

  fetchCurrentUser(): Observable<User> {
    return this.api.get<User>(ENDPOINTS.auth.me);
  }

  restoreSession(): Observable<User | null> {
    if (!this.token()) {
      return of(null);
    }
    return this.fetchCurrentUser().pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh');
    localStorage.removeItem('auth_user');
    this.router.navigate(['/login']);
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
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

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.user() && auth.hasRole(allowedRoles)) {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  };
};
