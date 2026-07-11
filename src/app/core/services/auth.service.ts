import { Injectable, inject, signal } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiService } from '../api/api.service';
import { ENDPOINTS } from '../api/endpoints';
import { User } from '../api/models';
import { ToastService } from '../../shared/services/toast.service';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

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

  login(username: string): Observable<any> {
    return this.api.post<any>(ENDPOINTS.auth.login, { username, password: 'password123' }).pipe(
      tap(res => {
        this.token.set(res.access);
        this.currentUser.set(res.user);
        localStorage.setItem('auth_token', res.access);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        this.toast.success(`¡Bienvenido de vuelta, ${res.user.username}!`);
      }),
      catchError(err => {
        this.toast.error('Nombre de usuario o contraseña incorrectos.');
        throw err;
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.router.navigate(['/login']);
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.user()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.user() && auth.hasRole(allowedRoles)) {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  };
};
