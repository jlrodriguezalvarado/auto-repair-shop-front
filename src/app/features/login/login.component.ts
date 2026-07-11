import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  username = '';
  loading = signal(false);

  onSubmit(): void {
    if (!this.username) return;
    this.loading.set(true);
    this.auth.login(this.username).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
