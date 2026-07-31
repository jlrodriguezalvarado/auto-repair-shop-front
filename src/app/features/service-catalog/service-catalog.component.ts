import { Component, inject, signal, OnInit, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceCatalogRepository } from './service-catalog.repository';
import { ServiceCatalog, DeletedFilter } from '../../core/api/models';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { DialogFormDirective } from '../../shared/directives/dialog-form.directive';

@Component({
  selector: 'app-service-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent, DialogFormDirective],
  templateUrl: './service-catalog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./service-catalog.component.scss']
})
export class ServiceCatalogComponent implements OnInit {
  private repository = inject(ServiceCatalogRepository);
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  services = signal<ServiceCatalog[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Search/Filters
  searchQuery = signal('');
  deletedFilter = signal<DeletedFilter>('false');

  // Modal directives
  serviceModal = viewChild.required(DialogFormDirective);

  // Form State
  modalTitle = signal('');
  editingId = signal<number | null>(null);
  formModel = {
    name: '',
    description: '',
    basePrice: 0,
    estimatedDurationMinutes: 30,
    isActive: true
  };

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: { search?: string; deleted?: DeletedFilter } = { deleted: this.deletedFilter() };
    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    this.repository.list(params).subscribe({
      next: (res) => {
        this.services.set(res.results ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loadServices();
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as DeletedFilter;
    this.deletedFilter.set(value);
    this.loadServices();
  }

  openCreateModal(): void {
    this.modalTitle.set('Crear Servicio');
    this.editingId.set(null);
    this.formModel = {
      name: '',
      description: '',
      basePrice: 0,
      estimatedDurationMinutes: 30,
      isActive: true
    };
    this.serviceModal().open();
  }

  openEditModal(service: ServiceCatalog): void {
    this.modalTitle.set('Editar Servicio');
    this.editingId.set(service.id);
    this.formModel = {
      name: service.name,
      description: service.description || '',
      basePrice: service.basePrice,
      estimatedDurationMinutes: service.estimatedDurationMinutes,
      isActive: service.isActive
    };
    this.serviceModal().open();
  }

  saveService(): void {
    if (!this.formModel.name || this.formModel.basePrice < 0) {
      this.toast.error('Por favor, valide los campos obligatorios');
      return;
    }

    const id = this.editingId();
    if (id) {
      this.repository.update(id, this.formModel).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.serviceModal().close();
          this.loadServices();
        },
        error: () => this.toast.error('Error al actualizar servicio')
      });
    } else {
      this.repository.create(this.formModel).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.serviceModal().close();
          this.loadServices();
        },
        error: () => this.toast.error('Error al crear servicio')
      });
    }
  }

  deleteService(service: ServiceCatalog): void {
    this.confirm.confirm({
      title: 'Eliminar Servicio',
      message: `¿Está seguro de que desea eliminar el servicio "${service.name}"? Podrá restaurarlo después.`
    }).then(approved => {
      if (approved) {
        this.repository.delete(service.id).subscribe({
          next: () => {
            this.toast.success('Servicio eliminado');
            this.loadServices();
          },
          error: () => this.toast.error('Error al eliminar')
        });
      }
    });
  }

  restoreService(service: ServiceCatalog): void {
    this.confirm.confirm({
      title: 'Restaurar Servicio',
      message: `¿Restaurar el servicio "${service.name}"?`
    }).then(approved => {
      if (approved) {
        this.repository.restore(service.id).subscribe({
          next: () => {
            this.toast.success('Servicio restaurado');
            this.loadServices();
          },
          error: () => this.toast.error('Error al restaurar')
        });
      }
    });
  }

  hardDeleteService(service: ServiceCatalog): void {
    this.confirm.confirm({
      title: this.i18n.translate('softDelete.hardDeleteTitle'),
      message: this.i18n.translate('softDelete.hardDeleteMessage', { name: service.name }),
      confirmText: this.i18n.translate('actions.hardDelete')
    }).then(approved => {
      if (approved) {
        this.repository.hardDelete(service.id).subscribe({
          next: () => {
            this.toast.success(this.i18n.translate('softDelete.hardDeleteSuccess'));
            this.loadServices();
          },
          error: () => this.toast.error(this.i18n.translate('softDelete.hardDeleteFailed'))
        });
      }
    });
  }
}
