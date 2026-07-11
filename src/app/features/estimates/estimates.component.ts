import { Component, inject, signal, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstimatesRepository } from './estimates.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { VehiclesRepository } from '../vehicles/vehicles.repository';
import { ServiceCatalogRepository } from '../service-catalog/service-catalog.repository';
import { Estimate, CustomerProfile, Vehicle, ServiceCatalog } from '../../core/api/models';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { DialogFormDirective } from '../../shared/directives/dialog-form.directive';

@Component({
  selector: 'app-estimates',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent, DialogFormDirective],
  templateUrl: './estimates.component.html',
  styleUrls: ['./estimates.component.scss']
})
export class EstimatesComponent implements OnInit {
  private repository = inject(EstimatesRepository);
  private customersRepository = inject(CustomersRepository);
  private vehiclesRepository = inject(VehiclesRepository);
  private servicesRepository = inject(ServiceCatalogRepository);

  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  estimates = signal<Estimate[]>([]);
  customers = signal<CustomerProfile[]>([]);
  vehicles = signal<Vehicle[]>([]);
  catalogServices = signal<ServiceCatalog[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  // Search/Filters
  statusFilter = signal<string>('all');
  selectedCustomerFilter = signal<string>('all');

  // Detail View
  selectedEstimate = signal<Estimate | null>(null);

  // Modal directives
  estimateDialog = viewChild.required<DialogFormDirective>('estimateModalDirective');
  serviceDialog = viewChild.required<DialogFormDirective>('serviceModalDirective');

  // Creation/Edit state
  modalTitle = signal('');
  editingId = signal<number | null>(null);
  formModel = {
    customer: 0,
    vehicle: 0,
    validUntil: '',
    notes: '',
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0
  };

  // Service item Form State
  serviceFormModel = {
    name: '',
    quantity: 1,
    price: 0
  };

  ngOnInit(): void {
    this.loadEstimates();
    this.loadFilterData();
  }

  loadEstimates(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: any = {};
    if (this.statusFilter() !== 'all') {
      params.status = this.statusFilter();
    }
    if (this.selectedCustomerFilter() !== 'all') {
      params.customer = this.selectedCustomerFilter();
    }

    this.repository.list(params).subscribe({
      next: (res) => {
        this.estimates.set(res.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  loadFilterData(): void {
    this.customersRepository.list().subscribe(res => this.customers.set(res.results));
    this.vehiclesRepository.list().subscribe(res => this.vehicles.set(res.results));
    this.servicesRepository.list({ isActive: true }).subscribe(res => this.catalogServices.set(res.results));
  }

  getCustomerName(id: number): string {
    const cust = this.customers().find(c => c.id === id);
    return cust ? `${cust.firstName} ${cust.lastName}` : `Cliente #${id}`;
  }

  getVehiclePlate(id: number): string {
    const veh = this.vehicles().find(v => v.id === id);
    return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : `Vehículo #${id}`;
  }

  viewDetail(est: Estimate): void {
    this.selectedEstimate.set(est);
  }

  closeDetail(): void {
    this.selectedEstimate.set(null);
  }

  openCreateModal(): void {
    this.modalTitle.set('Crear Presupuesto');
    this.editingId.set(null);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const validUntilStr = futureDate.toISOString().split('T')[0];

    this.formModel = {
      customer: this.customers().length > 0 ? this.customers()[0].id : 0,
      vehicle: this.vehicles().length > 0 ? this.vehicles()[0].id : 0,
      validUntil: validUntilStr,
      notes: '',
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      total: 0
    };
    this.estimateDialog().open();
  }

  openEditModal(est: Estimate, event: Event): void {
    event.stopPropagation();
    this.modalTitle.set('Editar Presupuesto');
    this.editingId.set(est.id);
    this.formModel = {
      customer: est.customer,
      vehicle: est.vehicle,
      validUntil: est.validUntil,
      notes: est.notes || '',
      subtotal: est.subtotal,
      discountAmount: est.discountAmount,
      taxAmount: est.taxAmount,
      total: est.total
    };
    this.estimateDialog().open();
  }

  recalculateFormTotals(): void {
    this.formModel.taxAmount = parseFloat((this.formModel.subtotal * 0.16).toFixed(2));
    this.formModel.total = parseFloat((this.formModel.subtotal - this.formModel.discountAmount + this.formModel.taxAmount).toFixed(2));
  }

  saveEstimate(): void {
    if (!this.formModel.customer || !this.formModel.vehicle || !this.formModel.validUntil) {
      this.toast.error('Complete todos los campos obligatorios');
      return;
    }

    const id = this.editingId();
    if (id) {
      this.repository.update(id, this.formModel).subscribe({
        next: (res) => {
          this.toast.success(this.i18n.translate('common.success'));
          this.estimateDialog().close();
          this.loadEstimates();
          if (this.selectedEstimate()?.id === id) {
            this.selectedEstimate.set(res);
          }
        },
        error: () => this.toast.error('Error al actualizar presupuesto')
      });
    } else {
      this.repository.create({ ...this.formModel, status: 'draft', services: [], items: [] }).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.estimateDialog().close();
          this.loadEstimates();
        },
        error: () => this.toast.error('Error al crear presupuesto')
      });
    }
  }

  approveEstimate(est: Estimate): void {
    this.repository.approve(est.id).subscribe({
      next: (res) => {
        this.toast.success('Presupuesto Aprobado');
        this.loadEstimates();
        this.selectedEstimate.set(res);
      }
    });
  }

  rejectEstimate(est: Estimate): void {
    this.repository.reject(est.id).subscribe({
      next: (res) => {
        this.toast.success('Presupuesto Rechazado');
        this.loadEstimates();
        this.selectedEstimate.set(res);
      }
    });
  }

  createWorkOrderFromEstimate(est: Estimate): void {
    this.repository.createWorkOrder(est.id).subscribe({
      next: () => {
        this.toast.success('Orden de Trabajo creada exitosamente desde este presupuesto');
        this.loadEstimates();
      },
      error: () => this.toast.error('Error al crear Orden de Trabajo')
    });
  }

  downloadPdf(est: Estimate): void {
    this.repository.getPdf(est.id).subscribe({
      next: (res) => {
        window.open(res.pdfFile, '_blank');
        this.toast.success('PDF descargado bajo demanda');
      }
    });
  }

  persistPdf(est: Estimate): void {
    this.repository.persistPdf(est.id).subscribe({
      next: (res) => {
        this.toast.success('Archivo de PDF guardado de manera explícita en el servidor');
        this.selectedEstimate.set(res);
        this.loadEstimates();
      }
    });
  }

  getWhatsAppLink(est: Estimate): string {
    const plate = this.vehicles().find(v => v.id === est.vehicle)?.plate || '';
    const message = encodeURIComponent(`Hola, le enviamos el presupuesto ${est.code} de su vehículo ${plate}. Total: $${est.total}.`);
    const phone = this.customers().find(c => c.id === est.customer)?.phone || '';
    const cleanPhone = phone.replace(/[+\s]/g, '');
    return `https://wa.me/${cleanPhone}?text=${message}`;
  }

  openAddServiceModal(): void {
    this.serviceFormModel = {
      name: this.catalogServices().length > 0 ? this.catalogServices()[0].name : '',
      quantity: 1,
      price: this.catalogServices().length > 0 ? this.catalogServices()[0].basePrice : 0
    };
    this.serviceDialog().open();
  }

  onServiceSelectChange(event: any): void {
    const selectedName = event.target.value;
    const srv = this.catalogServices().find(s => s.name === selectedName);
    if (srv) {
      this.serviceFormModel.price = srv.basePrice;
    }
  }

  addServiceSnapshot(): void {
    const est = this.selectedEstimate();
    if (!est) return;

    if (!this.serviceFormModel.name || this.serviceFormModel.quantity <= 0) return;

    const list = est.services || [];
    const itemTotal = this.serviceFormModel.quantity * this.serviceFormModel.price;
    const newSnap = {
      name: this.serviceFormModel.name,
      quantity: this.serviceFormModel.quantity,
      price: this.serviceFormModel.price,
      total: itemTotal
    };

    const updatedServices = [...list, newSnap];
    const subtotal = updatedServices.reduce((sum, s) => sum + s.total, 0);
    const taxAmount = parseFloat((subtotal * 0.16).toFixed(2));
    const total = subtotal - est.discountAmount + taxAmount;

    this.repository.update(est.id, { services: updatedServices, subtotal, taxAmount, total }).subscribe(res => {
      this.selectedEstimate.set(res);
      this.loadEstimates();
      this.toast.success('Servicio añadido al presupuesto');
      this.serviceDialog().close();
    });
  }
}
