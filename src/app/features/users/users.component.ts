import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersRepository } from './users.repository';
import { User } from '../../core/api/models';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private repository = inject(UsersRepository);
  i18n = inject(I18nService);
  private toast = inject(ToastService);

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository.list().subscribe({
      next: (res) => {
        this.users.set(res.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  changeRole(user: User, event: any): void {
    const newRole = event.target.value;
    this.repository.update(user.id, { role: newRole }).subscribe({
      next: () => {
        this.toast.success('Rol de usuario actualizado');
        this.loadUsers();
      },
      error: () => this.toast.error('Error al actualizar rol')
    });
  }
}
