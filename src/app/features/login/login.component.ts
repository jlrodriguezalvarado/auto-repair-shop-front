import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  username = '';
  password = '';
  loading = signal(false);

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading.set(true);
    this.auth.login(this.username, this.password).subscribe({
      next: (user) => {
        this.router.navigate([user.role === 'SUPER_ADMIN' ? '/companies' : '/dashboard']);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
