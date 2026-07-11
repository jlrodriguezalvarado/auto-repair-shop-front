import { Component, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceCatalogRepository } from './service-catalog.repository';
import { ServiceCatalog } from '../../core/api/models';
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
  styleUrls: ['./service-catalog.component.scss']
})
export class ServiceCatalogComponent implements OnInit {
  private repository = inject(ServiceCatalogRepository);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  services = signal<ServiceCatalog[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Search/Filters
  searchQuery = signal('');
  activeFilter = signal<'all' | 'active' | 'inactive'>('all');

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
    const params: any = {};
    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }
    if (this.activeFilter() !== 'all') {
      params.isActive = this.activeFilter() === 'active';
    }

    this.repository.list(params).subscribe({
      next: (res) => {
        this.services.set(res.results);
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

  onFilterChange(event: any): void {
    this.activeFilter.set(event.target.value);
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

  deactivateService(service: ServiceCatalog): void {
    this.confirm.confirm({
      title: 'Desactivar Servicio',
      message: `¿Está seguro de que desea desactivar el servicio "${service.name}"?`
    }).then(approved => {
      if (approved) {
        this.repository.update(service.id, { isActive: false }).subscribe({
          next: () => {
            this.toast.success('Servicio desactivado');
            this.loadServices();
          },
          error: () => this.toast.error('Error al desactivar')
        });
      }
    });
  }
}
