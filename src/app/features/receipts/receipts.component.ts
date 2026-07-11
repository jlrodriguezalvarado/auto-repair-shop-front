import { Component, inject, signal, OnInit, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptsRepository } from './receipts.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { VehiclesRepository } from '../vehicles/vehicles.repository';
import { WorkOrdersRepository } from '../work-orders/work-orders.repository';
import { EstimatesRepository } from '../estimates/estimates.repository';
import { Receipt, CustomerProfile, Vehicle, WorkOrder, Estimate, ReceiptPayment } from '../../core/api/models';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { DialogFormDirective } from '../../shared/directives/dialog-form.directive';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent, DialogFormDirective],
  templateUrl: './receipts.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./receipts.component.scss']
})
export class ReceiptsComponent implements OnInit {
  private repository = inject(ReceiptsRepository);
  private customersRepository = inject(CustomersRepository);
  private vehiclesRepository = inject(VehiclesRepository);
  private workOrdersRepository = inject(WorkOrdersRepository);
  private estimatesRepository = inject(EstimatesRepository);

  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  receipts = signal<Receipt[]>([]);
  customers = signal<CustomerProfile[]>([]);
  vehicles = signal<Vehicle[]>([]);
  workOrders = signal<WorkOrder[]>([]);
  estimates = signal<Estimate[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  // Search/Filters
  statusFilter = signal<string>('all');
  selectedCustomerFilter = signal<string>('all');

  // Detailed selected receipt
  selectedReceipt = signal<Receipt | null>(null);

  // Modal directives
  receiptDialog = viewChild.required<DialogFormDirective>('receiptModalDirective');
  paymentDialog = viewChild.required<DialogFormDirective>('paymentModalDirective');

  // Creation Form State
  modalTitle = signal('');
  editingId = signal<number | null>(null);
  formModel = {
    customer: 0,
    vehicle: 0,
    workOrder: undefined as number | undefined,
    estimate: undefined as number | undefined,
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    total: 0,
    notes: ''
  };

  // Payment Form State
  paymentModel = {
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'card' | 'transfer' | 'mobile_payment' | 'zelle' | 'other',
    reference: '',
    paymentDate: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadReceipts();
    this.loadFilterData();
  }

  loadReceipts(): void {
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
        this.receipts.set(res.results);
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
    this.workOrdersRepository.list().subscribe(res => this.workOrders.set(res.results));
    this.estimatesRepository.list().subscribe(res => this.estimates.set(res.results));
  }

  getCustomerName(id: number): string {
    const cust = this.customers().find(c => c.id === id);
    return cust ? `${cust.firstName} ${cust.lastName}` : `Cliente #${id}`;
  }

  getVehiclePlate(id: number): string {
    const veh = this.vehicles().find(v => v.id === id);
    return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : `Vehículo #${id}`;
  }

  viewDetail(rec: Receipt): void {
    this.selectedReceipt.set(rec);
  }

  closeDetail(): void {
    this.selectedReceipt.set(null);
  }

  openCreateManualModal(): void {
    this.modalTitle.set('Emitir Recibo Manual');
    this.editingId.set(null);
    this.formModel = {
      customer: this.customers().length > 0 ? this.customers()[0].id : 0,
      vehicle: this.vehicles().length > 0 ? this.vehicles()[0].id : 0,
      workOrder: undefined,
      estimate: undefined,
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      total: 0,
      notes: ''
    };
    this.receiptDialog().open();
  }

  onOrderReferenceChange(event: any): void {
    const orderId = parseInt(event.target.value);
    const ord = this.workOrders().find(o => o.id === orderId);
    if (ord) {
      this.formModel.customer = ord.customer;
      this.formModel.vehicle = ord.vehicle;
      this.formModel.subtotal = ord.grandTotal;
      this.formModel.total = ord.grandTotal;
      this.formModel.notes = `Generado de forma automática desde Orden ${ord.code}`;
    }
  }

  onEstimateReferenceChange(event: any): void {
    const estId = parseInt(event.target.value);
    const est = this.estimates().find(e => e.id === estId);
    if (est) {
      this.formModel.customer = est.customer;
      this.formModel.vehicle = est.vehicle;
      this.formModel.subtotal = est.subtotal;
      this.formModel.discountAmount = est.discountAmount;
      this.formModel.taxAmount = est.taxAmount;
      this.formModel.total = est.total;
      this.formModel.notes = `Generado desde presupuesto aprobado ${est.code}`;
    }
  }

  recalculateFormTotals(): void {
    this.formModel.taxAmount = parseFloat((this.formModel.subtotal * 0.16).toFixed(2));
    this.formModel.total = parseFloat((this.formModel.subtotal - this.formModel.discountAmount + this.formModel.taxAmount).toFixed(2));
  }

  saveReceipt(): void {
    if (!this.formModel.customer || !this.formModel.vehicle || !this.formModel.subtotal) {
      this.toast.error('Complete todos los campos obligatorios');
      return;
    }

    this.repository.create(this.formModel).subscribe({
      next: () => {
        this.toast.success(this.i18n.translate('common.success'));
        this.receiptDialog().close();
        this.loadReceipts();
      },
      error: () => this.toast.error('Error al emitir recibo')
    });
  }

  downloadPdf(rec: Receipt): void {
    this.repository.openPdf(rec.id).subscribe({
      next: () => {
        this.toast.success('Descargando recibo PDF');
      },
      error: () => this.toast.error('Error al descargar PDF')
    });
  }

  persistPdf(rec: Receipt): void {
    this.repository.persistPdf(rec.id).subscribe({
      next: () => {
        this.toast.success('Archivo PDF respaldado en el servidor');
        this.repository.get(rec.id).subscribe(refreshed => {
          this.selectedReceipt.set(refreshed);
          this.loadReceipts();
        });
      },
      error: () => this.toast.error('Error al guardar PDF')
    });
  }

  getWhatsAppLink(rec: Receipt): string {
    const plate = this.vehicles().find(v => v.id === rec.vehicle)?.plate || '';
    const message = encodeURIComponent(`Hola, le enviamos el recibo ${rec.code} de su vehículo ${plate}. Monto total: $${rec.total}. Pendiente de pago: $${rec.pendingAmount}.`);
    const phone = this.customers().find(c => c.id === rec.customer)?.phone || '';
    const cleanPhone = phone.replace(/[+\s]/g, '');
    return `https://wa.me/${cleanPhone}?text=${message}`;
  }

  openPaymentModal(): void {
    const rec = this.selectedReceipt();
    if (!rec) return;

    this.paymentModel = {
      amount: rec.pendingAmount,
      paymentMethod: 'cash',
      reference: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    };
    this.paymentDialog().open();
  }

  savePayment(): void {
    const rec = this.selectedReceipt();
    if (!rec) return;

    if (this.paymentModel.amount <= 0) {
      this.toast.error('El monto del pago debe ser mayor que cero');
      return;
    }

    if (this.paymentModel.amount > rec.pendingAmount) {
      this.toast.error(this.i18n.translate('validation.paymentExceedsPending'));
      return;
    }

    this.repository.addPayment(rec.id, this.paymentModel).subscribe({
      next: () => {
        this.toast.success('Pago parcial registrado con éxito');
        this.paymentDialog().close();

        this.repository.get(rec.id).subscribe(refreshed => {
          this.selectedReceipt.set(refreshed);
          this.loadReceipts();
        });
      },
      error: () => this.toast.error('Error al registrar pago')
    });
  }
}
