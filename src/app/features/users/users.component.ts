import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersRepository } from './users.repository';
import { DeletedFilter, User } from '../../core/api/models';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
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
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  deletedFilter: DeletedFilter = 'false';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository.list({ deleted: this.deletedFilter }).subscribe({
      next: (res) => {
        this.users.set(res.results ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  changeRole(user: User, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value as User['role'];
    this.repository.update(user.id, { role: newRole }).subscribe({
      next: () => {
        this.toast.success('Rol de usuario actualizado');
        this.loadUsers();
      },
      error: () => this.toast.error('Error al actualizar rol')
    });
  }

  deleteUser(user: User): void {
    this.confirm.confirm({
      title: 'Eliminar Usuario',
      message: `¿Está seguro de que desea eliminar al usuario "${user.username}"? Podrá restaurarlo después.`
    }).then(approved => {
      if (approved) {
        this.repository.delete(user.id).subscribe({
          next: () => {
            this.toast.success('Usuario eliminado');
            this.loadUsers();
          },
          error: () => this.toast.error('Error al eliminar')
        });
      }
    });
  }

  restoreUser(user: User): void {
    this.confirm.confirm({
      title: 'Restaurar Usuario',
      message: `¿Restaurar al usuario "${user.username}"?`
    }).then(approved => {
      if (approved) {
        this.repository.restore(user.id).subscribe({
          next: () => {
            this.toast.success('Usuario restaurado');
            this.loadUsers();
          },
          error: () => this.toast.error('Error al restaurar')
        });
      }
    });
  }

  hardDeleteUser(user: User): void {
    this.confirm.confirm({
      title: this.i18n.translate('softDelete.hardDeleteTitle'),
      message: this.i18n.translate('softDelete.hardDeleteMessage', { name: user.username }),
      confirmText: this.i18n.translate('actions.hardDelete')
    }).then(approved => {
      if (approved) {
        this.repository.hardDelete(user.id).subscribe({
          next: () => {
            this.toast.success(this.i18n.translate('softDelete.hardDeleteSuccess'));
            this.loadUsers();
          },
          error: () => this.toast.error(this.i18n.translate('softDelete.hardDeleteFailed'))
        });
      }
    });
  }
}
