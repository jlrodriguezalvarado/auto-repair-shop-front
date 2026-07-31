import { Component, inject, signal, OnInit, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiclesRepository } from './vehicles.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { WorkOrdersRepository } from '../work-orders/work-orders.repository';
import { Vehicle, CustomerProfile, WorkOrder, DeletedFilter } from '../../core/api/models';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { DialogFormDirective } from '../../shared/directives/dialog-form.directive';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent, DialogFormDirective],
  templateUrl: './vehicles.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  private repository = inject(VehiclesRepository);
  private customersRepository = inject(CustomersRepository);
  private workOrdersRepository = inject(WorkOrdersRepository);
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  vehicles = signal<Vehicle[]>([]);
  customers = signal<CustomerProfile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Search/Filters (plain fields for ngModel two-way binding)
  searchQuery = '';
  selectedCustomerFilter = 'all';
  deletedFilter: DeletedFilter = 'false';

  // Detail / Associated Work Orders
  selectedVehicle = signal<Vehicle | null>(null);
  associatedOrders = signal<WorkOrder[]>([]);
  loadingOrders = signal(false);

  // Modal Directive
  vehicleModal = viewChild.required(DialogFormDirective);

  // Form State
  modalTitle = signal('');
  editingId = signal<number | null>(null);
  formModel = {
    customer: 0,
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    vin: '',
    notes: '',
    photo: '',
    isActive: true
  };

  ngOnInit(): void {
    this.loadVehicles();
    this.loadCustomers();
  }

  loadVehicles(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: { search?: string; customer?: string; deleted?: DeletedFilter } = { deleted: this.deletedFilter };
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.selectedCustomerFilter !== 'all') {
      params.customer = this.selectedCustomerFilter;
    }

    this.repository.list(params).subscribe({
      next: (res) => {
        this.vehicles.set(res.results ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  loadCustomers(): void {
    this.customersRepository.list().subscribe(res => {
      this.customers.set(res.results ?? []);
    });
  }

  getCustomerName(id: number): string {
    const cust = this.customers().find(c => c.id === id);
    return cust ? `${cust.firstName} ${cust.lastName}` : `Cliente #${id}`;
  }

  viewDetail(vehicle: Vehicle): void {
    this.selectedVehicle.set(vehicle);
    this.loadingOrders.set(true);
    this.workOrdersRepository.list({ vehicle: vehicle.id }).subscribe({
      next: (res) => {
        this.associatedOrders.set(res.results ?? []);
        this.loadingOrders.set(false);
      },
      error: () => {
        this.loadingOrders.set(false);
      }
    });
  }

  closeDetail(): void {
    this.selectedVehicle.set(null);
    this.associatedOrders.set([]);
  }

  openCreateModal(): void {
    this.modalTitle.set('Registrar Vehículo');
    this.editingId.set(null);
    this.formModel = {
      customer: this.customers().length > 0 ? this.customers()[0].id : 0,
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      vin: '',
      notes: '',
      photo: '',
      isActive: true
    };
    this.vehicleModal().open();
  }

  openEditModal(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    this.modalTitle.set('Editar Vehículo');
    this.editingId.set(vehicle.id);
    this.formModel = {
      customer: vehicle.customer,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vin: vehicle.vin || '',
      notes: vehicle.notes || '',
      photo: vehicle.photo || '',
      isActive: vehicle.isActive
    };
    this.vehicleModal().open();
  }

  saveVehicle(): void {
    if (!this.formModel.customer || !this.formModel.plate || !this.formModel.brand || !this.formModel.model) {
      this.toast.error('Complete todos los campos obligatorios de placa, marca y modelo');
      return;
    }

    const id = this.editingId();
    if (id) {
      this.repository.update(id, this.formModel).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.vehicleModal().close();
          this.loadVehicles();
        },
        error: () => this.toast.error('Error al actualizar vehículo')
      });
    } else {
      this.repository.create(this.formModel).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.vehicleModal().close();
          this.loadVehicles();
        },
        error: () => this.toast.error('Error al registrar vehículo')
      });
    }
  }

  deleteVehicle(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: 'Eliminar Vehículo',
      message: `¿Está seguro de que desea eliminar el vehículo con placa "${vehicle.plate}"? Podrá restaurarlo después.`
    }).then(approved => {
      if (approved) {
        this.repository.delete(vehicle.id).subscribe({
          next: () => {
            this.toast.success('Vehículo eliminado');
            if (this.selectedVehicle()?.id === vehicle.id) {
              this.closeDetail();
            }
            this.loadVehicles();
          },
          error: () => this.toast.error('Error al eliminar')
        });
      }
    });
  }

  restoreVehicle(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: 'Restaurar Vehículo',
      message: `¿Restaurar el vehículo con placa "${vehicle.plate}"?`
    }).then(approved => {
      if (approved) {
        this.repository.restore(vehicle.id).subscribe({
          next: () => {
            this.toast.success('Vehículo restaurado');
            this.loadVehicles();
          },
          error: () => this.toast.error('Error al restaurar')
        });
      }
    });
  }

  hardDeleteVehicle(vehicle: Vehicle, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: this.i18n.translate('softDelete.hardDeleteTitle'),
      message: this.i18n.translate('softDelete.hardDeleteMessage', { name: vehicle.plate }),
      confirmText: this.i18n.translate('actions.hardDelete')
    }).then(approved => {
      if (approved) {
        this.repository.hardDelete(vehicle.id).subscribe({
          next: () => {
            this.toast.success(this.i18n.translate('softDelete.hardDeleteSuccess'));
            if (this.selectedVehicle()?.id === vehicle.id) {
              this.closeDetail();
            }
            this.loadVehicles();
          },
          error: () => this.toast.error(this.i18n.translate('softDelete.hardDeleteFailed'))
        });
      }
    });
  }

  triggerPhotoMockUpload(): void {
    // Simulated upload
    this.formModel.photo = 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=300';
    this.toast.success('¡Foto cargada de manera simulada!');
  }
}
