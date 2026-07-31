import { Component, inject, signal, OnInit, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkOrdersRepository } from './work-orders.repository';
import { CustomersRepository } from '../customers/customers.repository';
import { VehiclesRepository } from '../vehicles/vehicles.repository';
import { ServiceCatalogRepository } from '../service-catalog/service-catalog.repository';
import { UsersRepository } from '../users/users.repository';
import { WorkOrder, CustomerProfile, Vehicle, ServiceCatalog, User, WorkOrderService, WorkOrderItem, DeletedFilter } from '../../core/api/models';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { DialogFormDirective } from '../../shared/directives/dialog-form.directive';

@Component({
  selector: 'app-work-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent, DialogFormDirective],
  templateUrl: './work-orders.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./work-orders.component.scss']
})
export class WorkOrdersComponent implements OnInit {
  private repository = inject(WorkOrdersRepository);
  private customersRepository = inject(CustomersRepository);
  private vehiclesRepository = inject(VehiclesRepository);
  private servicesRepository = inject(ServiceCatalogRepository);
  auth = inject(AuthService);
  private usersRepository = inject(UsersRepository);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

  orders = signal<WorkOrder[]>([]);
  customers = signal<CustomerProfile[]>([]);
  vehicles = signal<Vehicle[]>([]);
  catalogServices = signal<ServiceCatalog[]>([]);
  mechanics = signal<User[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  // Search/Filters
  statusFilter = signal<string>('all');
  selectedCustomerFilter = signal<string>('all');
  deletedFilter = signal<DeletedFilter>('false');

  // Detailed selected order
  selectedOrder = signal<WorkOrder | null>(null);

  // Modals directives
  orderDialog = viewChild.required<DialogFormDirective>('orderModalDirective');
  serviceDialog = viewChild.required<DialogFormDirective>('serviceModalDirective');
  itemDialog = viewChild.required<DialogFormDirective>('itemModalDirective');

  // Creation / Edit Form State
  modalTitle = signal('');
  editingId = signal<number | null>(null);
  formModel = {
    customer: 0,
    vehicle: 0,
    customerComplaint: '',
    privateNote: '',
    diagnosisNote: ''
  };

  // Add Service Form State
  serviceFormModel = {
    serviceId: 0,
    quantity: 1,
    unitPrice: 0,
    notes: ''
  };

  // Add Item Form State
  itemFormModel = {
    name: '',
    description: '',
    quantity: 1,
    unitCost: 0,
    providedBy: 'workshop' as 'client' | 'workshop',
    supplierName: '',
    purchaseDate: '',
    notes: ''
  };

  ngOnInit(): void {
    this.loadOrders();
    this.loadFilterData();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: { status?: string; customer?: string; deleted?: DeletedFilter } = { deleted: this.deletedFilter() };
    if (this.statusFilter() !== 'all') {
      params.status = this.statusFilter();
    }
    if (this.selectedCustomerFilter() !== 'all') {
      params.customer = this.selectedCustomerFilter();
    }

    this.repository.list(params).subscribe({
      next: (res) => {
        this.orders.set(res.results ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  loadFilterData(): void {
    this.customersRepository.list().subscribe(res => this.customers.set(res.results ?? []));
    this.vehiclesRepository.list().subscribe(res => this.vehicles.set(res.results ?? []));
    this.servicesRepository.list({ isActive: true }).subscribe(res => this.catalogServices.set(res.results ?? []));
    this.usersRepository.list().subscribe(res => {
      this.mechanics.set((res.results ?? []).filter(u => u.role === 'MECHANIC'));
    });
  }

  getCustomerName(id: number): string {
    const cust = this.customers().find(c => c.id === id);
    return cust ? `${cust.firstName} ${cust.lastName}` : `Cliente #${id}`;
  }

  getVehiclePlate(id: number): string {
    const veh = this.vehicles().find(v => v.id === id);
    return veh ? `${veh.brand} ${veh.model} (${veh.plate})` : `Vehículo #${id}`;
  }

  getMechanicName(id?: number): string {
    if (!id) return 'Sin asignar';
    const mech = this.mechanics().find(u => u.id === id);
    return mech ? mech.username : `Mecánico #${id}`;
  }

  viewDetail(order: WorkOrder): void {
    this.selectedOrder.set(order);
  }

  closeDetail(): void {
    this.selectedOrder.set(null);
  }

  openCreateModal(): void {
    this.modalTitle.set('Nueva Orden de Trabajo');
    this.editingId.set(null);
    this.formModel = {
      customer: this.customers().length > 0 ? this.customers()[0].id : 0,
      vehicle: this.vehicles().length > 0 ? this.vehicles()[0].id : 0,
      customerComplaint: '',
      privateNote: '',
      diagnosisNote: ''
    };
    this.orderDialog().open();
  }

  openEditModal(order: WorkOrder, event: Event): void {
    event.stopPropagation();
    this.modalTitle.set('Editar Orden de Trabajo');
    this.editingId.set(order.id);
    this.formModel = {
      customer: order.customer,
      vehicle: order.vehicle,
      customerComplaint: order.customerComplaint,
      privateNote: order.privateNote || '',
      diagnosisNote: order.diagnosisNote || ''
    };
    this.orderDialog().open();
  }

  saveOrder(): void {
    if (!this.formModel.customer || !this.formModel.vehicle || !this.formModel.customerComplaint) {
      this.toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    const id = this.editingId();
    if (id) {
      this.repository.update(id, this.formModel).subscribe({
        next: (res) => {
          this.toast.success(this.i18n.translate('common.success'));
          this.orderDialog().close();
          this.loadOrders();
          if (this.selectedOrder()?.id === id) {
            this.selectedOrder.set(res);
          }
        },
        error: () => this.toast.error('Error al actualizar orden')
      });
    } else {
      this.repository.create(this.formModel).subscribe({
        next: () => {
          this.toast.success(this.i18n.translate('common.success'));
          this.orderDialog().close();
          this.loadOrders();
        },
        error: () => this.toast.error('Error al crear orden')
      });
    }
  }

  changeStatus(order: WorkOrder, status: string): void {
    this.repository.changeStatus(order.id, status).subscribe({
      next: (res) => {
        this.toast.success('Estado actualizado exitosamente');
        this.loadOrders();
        if (this.selectedOrder()?.id === order.id) {
          this.selectedOrder.set(res);
        }
      },
      error: () => this.toast.error('Error al cambiar el estado')
    });
  }

  assignMechanic(order: WorkOrder, event: any): void {
    const mechId = parseInt(event.target.value);
    if (!mechId) return;

    this.repository.assignMechanic(order.id, mechId).subscribe({
      next: (res) => {
        this.toast.success('Mecánico asignado');
        this.loadOrders();
        if (this.selectedOrder()?.id === order.id) {
          this.selectedOrder.set(res);
        }
      },
      error: () => this.toast.error('Error al asignar mecánico')
    });
  }

  openAddServiceModal(): void {
    if (this.catalogServices().length === 0) {
      this.toast.error('No hay servicios activos en el catálogo');
      return;
    }
    const defSrv = this.catalogServices()[0];
    this.serviceFormModel = {
      serviceId: defSrv.id,
      quantity: 1,
      unitPrice: defSrv.basePrice,
      notes: ''
    };
    this.serviceDialog().open();
  }

  onServiceSelectChange(event: any): void {
    const srvId = parseInt(event.target.value);
    const srv = this.catalogServices().find(s => s.id === srvId);
    if (srv) {
      this.serviceFormModel.unitPrice = srv.basePrice;
    }
  }

  saveServiceSnapshot(): void {
    const order = this.selectedOrder();
    if (!order) return;

    const srv = this.catalogServices().find(s => s.id === this.serviceFormModel.serviceId);
    if (!srv) return;

    const currentServices = order.services || [];
    const newService: WorkOrderService = {
      id: currentServices.length + 1,
      workOrder: order.id,
      service: srv.id,
      nameSnapshot: srv.name,
      descriptionSnapshot: srv.description,
      quantity: this.serviceFormModel.quantity,
      unitPrice: this.serviceFormModel.unitPrice,
      totalPrice: this.serviceFormModel.quantity * this.serviceFormModel.unitPrice,
      notes: this.serviceFormModel.notes
    };

    const updatedList = [...currentServices, newService];

    const servicesTotal = updatedList.reduce((sum, s) => sum + s.totalPrice, 0);
    const grandTotal = servicesTotal + (order.itemsTotal || 0);

    this.repository.saveServices(order.id, updatedList).subscribe({
      next: () => {
        this.repository.update(order.id, { servicesTotal, grandTotal }).subscribe(updatedOrder => {
          this.selectedOrder.set(updatedOrder);
          this.loadOrders();
          this.toast.success('Servicio agregado con éxito');
          this.serviceDialog().close();
        });
      },
      error: () => this.toast.error('Error al agregar servicio')
    });
  }

  deleteServiceSnapshot(srvId: number): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.confirm.confirm({
      title: 'Eliminar Servicio',
      message: '¿Está seguro de que desea remover este servicio de la orden?'
    }).then(approved => {
      if (approved) {
        const currentServices = order.services || [];
        const updatedList = currentServices.filter(s => s.id !== srvId);

        const servicesTotal = updatedList.reduce((sum, s) => sum + s.totalPrice, 0);
        const grandTotal = servicesTotal + (order.itemsTotal || 0);

        this.repository.saveServices(order.id, updatedList).subscribe({
          next: () => {
            this.repository.update(order.id, { servicesTotal, grandTotal }).subscribe(updatedOrder => {
              this.selectedOrder.set(updatedOrder);
              this.loadOrders();
              this.toast.success('Servicio removido');
            });
          }
        });
      }
    });
  }

  openAddItemModal(): void {
    this.itemFormModel = {
      name: '',
      description: '',
      quantity: 1,
      unitCost: 0,
      providedBy: 'workshop',
      supplierName: '',
      purchaseDate: '',
      notes: ''
    };
    this.itemDialog().open();
  }

  saveItemSnapshot(): void {
    const order = this.selectedOrder();
    if (!order) return;

    if (!this.itemFormModel.name || this.itemFormModel.quantity <= 0 || this.itemFormModel.unitCost < 0) {
      this.toast.error('Por favor, valide los campos requeridos');
      return;
    }

    const currentItems = order.items || [];
    const newItem: WorkOrderItem = {
      id: currentItems.length + 1,
      workOrder: order.id,
      name: this.itemFormModel.name,
      description: this.itemFormModel.description,
      quantity: this.itemFormModel.quantity,
      unitCost: this.itemFormModel.unitCost,
      totalCost: this.itemFormModel.quantity * this.itemFormModel.unitCost,
      providedBy: this.itemFormModel.providedBy,
      supplierName: this.itemFormModel.supplierName,
      purchaseDate: this.itemFormModel.purchaseDate,
      notes: this.itemFormModel.notes
    };

    const updatedList = [...currentItems, newItem];
    const itemsTotal = updatedList.reduce((sum, i) => sum + i.totalCost, 0);
    const grandTotal = (order.servicesTotal || 0) + itemsTotal;

    this.repository.saveItems(order.id, updatedList).subscribe({
      next: () => {
        this.repository.update(order.id, { itemsTotal, grandTotal }).subscribe(updatedOrder => {
          this.selectedOrder.set(updatedOrder);
          this.loadOrders();
          this.toast.success('Artículo agregado con éxito');
          this.itemDialog().close();
        });
      },
      error: () => this.toast.error('Error al guardar artículo')
    });
  }

  deleteItemSnapshot(itemId: number): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.confirm.confirm({
      title: 'Eliminar Artículo',
      message: '¿Está seguro de que desea remover este repuesto/artículo?'
    }).then(approved => {
      if (approved) {
        const currentItems = order.items || [];
        const updatedList = currentItems.filter(i => i.id !== itemId);

        const itemsTotal = updatedList.reduce((sum, i) => sum + i.totalCost, 0);
        const grandTotal = (order.servicesTotal || 0) + itemsTotal;

        this.repository.saveItems(order.id, updatedList).subscribe({
          next: () => {
            this.repository.update(order.id, { itemsTotal, grandTotal }).subscribe(updatedOrder => {
              this.selectedOrder.set(updatedOrder);
              this.loadOrders();
              this.toast.success('Artículo removido');
            });
          }
        });
      }
    });
  }

  deleteOrder(order: WorkOrder, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: 'Eliminar Orden',
      message: `¿Está seguro de que desea eliminar la orden "${order.code}"? Podrá restaurarla después.`
    }).then(approved => {
      if (approved) {
        this.repository.delete(order.id).subscribe({
          next: () => {
            this.toast.success('Orden eliminada');
            if (this.selectedOrder()?.id === order.id) {
              this.selectedOrder.set(null);
            }
            this.loadOrders();
          },
          error: () => this.toast.error('Error al eliminar')
        });
      }
    });
  }

  restoreOrder(order: WorkOrder, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: 'Restaurar Orden',
      message: `¿Restaurar la orden "${order.code}"?`
    }).then(approved => {
      if (approved) {
        this.repository.restore(order.id).subscribe({
          next: () => {
            this.toast.success('Orden restaurada');
            this.loadOrders();
          },
          error: () => this.toast.error('Error al restaurar')
        });
      }
    });
  }

  hardDeleteOrder(order: WorkOrder, event: Event): void {
    event.stopPropagation();
    this.confirm.confirm({
      title: this.i18n.translate('softDelete.hardDeleteTitle'),
      message: this.i18n.translate('softDelete.hardDeleteMessage', { name: order.code }),
      confirmText: this.i18n.translate('actions.hardDelete')
    }).then(approved => {
      if (approved) {
        this.repository.hardDelete(order.id).subscribe({
          next: () => {
            this.toast.success(this.i18n.translate('softDelete.hardDeleteSuccess'));
            if (this.selectedOrder()?.id === order.id) {
              this.selectedOrder.set(null);
            }
            this.loadOrders();
          },
          error: () => this.toast.error(this.i18n.translate('softDelete.hardDeleteFailed'))
        });
      }
    });
  }
}
