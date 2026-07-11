import { Component, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomersRepository } from './customers.repository';
import { VehiclesRepository } from '../vehicles/vehicles.repository';
import { CustomerProfile, Vehicle } from '../../core/api/models';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { DialogFormDirective } from '../../shared/directives/dialog-form.directive';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent, DialogFormDirective],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  private repository = inject(CustomersRepository);
  private vehiclesRepository = inject(VehiclesRepository);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  customers = signal<CustomerProfile[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // Search/Filters
  searchQuery = signal('');
  activeFilter = signal<'all' | 'active' | 'inactive'>('all');

  // Detail / Associated Vehicles
  selectedCustomer = signal<CustomerProfile | null>(null);
  associatedVehicles = signal<Vehicle[]>([]);
  loadingVehicles = signal(false);

  // Modal directives
  customerDialog = viewChild.required<DialogFormDirective>('customerModalDirective');
  vehicleDialog = viewChild.required<DialogFormDirective>('vehicleModalDirective');

  // Form States
  modalTitle = signal('');
  editingId = signal<number | null>(null);
  formModel = {
    firstName: '',
    lastName: '',
    documentId: '',
    phone: '',
    secondaryPhone: '',
    email: '',
    address: '',
    notes: '',
    isActive: true
  };

  // Add vehicle form state
  vehicleFormModel = {
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    notes: '',
    isActive: true
  };

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
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
        this.customers.set(res.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  viewDetail(customer: CustomerProfile): void {
    this.selectedCustomer.set(customer);
    this.loadingVehicles.set(true);
    this.vehiclesRepository.list({ customer: customer.id }).subscribe({
      next: (res) => {
        this.associatedVehicles.set(res.results);
        this.loadingVehicles.set(false);
      },
      error: () => {
        this.loadingVehicles.set(false);
      }
    });
  }

  closeDetail(): void {
    this.selectedCustomer.set(null);
    this.associatedVehicles.set([]);
  }

  openCreateModal(): void {
    this.modalTitle.set('Crear Cliente');
    this.editingId.set(null);
    this.formModel = {
      firstName: '',
      lastName: '',
      documentId: '',
      phone: '',
      secondaryPhone: '',
      email: '',
      address: '',
      notes: '',
      isActive: true
    };
    this.customerDialog().open();
  }

  openEditModal(customer: CustomerProfile, event: Event): void {
    event.stopPropagation();
    this.modalTitle.set('Editar Cliente');
    this.editingId.set(customer.id);
    this.formModel = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      documentId: customer.documentId,
      phone: customer.phone,
      secondaryPhone: customer.secondaryPhone || '',
      email: customer.email,
      address: customer.address,
      notes: customer.notes || '',
      isActive: customer.isActive
    };
    this.customerDialog().open();
  }

  saveCustomer(): void {
    if (!this.formModel.firstName || !this.formModel.lastName || !this.formModel.documentId || !this.formModel.phone) {
      this.toast.error('Complete todos los campos obligatorios');
      return;
    }

    const id = this.editingId();
    if (id) {
      this.repository.update(id, this.formModel).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.customerDialog().close();
          this.loadCustomers();
        },
        error: () => this.toast.error('Error al actualizar cliente')
      });
    } else {
      this.repository.create(this.formModel).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.customerDialog().close();
          this.loadCustomers();
        },
        error: () => this.toast.error('Error al crear cliente')
      });
    }
  }

  deactivateCustomer(customer: CustomerProfile, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: 'Desactivar Cliente',
      message: `¿Está seguro de que desea desactivar al cliente "${customer.firstName} ${customer.lastName}"?`
    }).then(approved => {
      if (approved) {
        this.repository.update(customer.id, { isActive: false }).subscribe({
          next: () => {
            this.toast.success('Cliente desactivado');
            this.loadCustomers();
          },
          error: () => this.toast.error('Error al desactivar')
        });
      }
    });
  }

  openAddVehicleModal(): void {
    const cust = this.selectedCustomer();
    if (!cust) return;

    this.vehicleFormModel = {
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      notes: '',
      isActive: true
    };
    this.vehicleDialog().open();
  }

  saveVehicle(): void {
    const cust = this.selectedCustomer();
    if (!cust) return;

    if (!this.vehicleFormModel.plate || !this.vehicleFormModel.brand || !this.vehicleFormModel.model) {
      this.toast.error('Por favor, valide los campos obligatorios de placa, marca y modelo');
      return;
    }

    const payload = {
      ...this.vehicleFormModel,
      customer: cust.id
    };

    this.vehiclesRepository.create(payload).subscribe({
      next: () => {
        this.toast.success('Vehículo creado y asociado al cliente');
        this.vehicleDialog().close();
        this.viewDetail(cust);
      },
      error: () => this.toast.error('Error al guardar vehículo')
    });
  }
}
