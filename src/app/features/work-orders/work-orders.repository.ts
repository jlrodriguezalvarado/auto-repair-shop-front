import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DeletedFilter, WorkOrder, WorkOrderService, WorkOrderItem } from '../../core/api/models';
import { Observable, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkOrdersRepository {
  private api = inject(ApiService);

  list(params?: {
    status?: string;
    customer?: number | string;
    vehicle?: number | string;
    deleted?: DeletedFilter;
  }): Observable<PaginatedResponse<WorkOrder>> {
    return this.api.get<PaginatedResponse<WorkOrder>>(ENDPOINTS.workOrders.list, params).pipe(
      map((page) => ({
        ...page,
        results: (page.results ?? []).map((order) => this.normalizeOrder(order)),
      }))
    );
  }

  get(id: number | string): Observable<WorkOrder> {
    return this.api.get<WorkOrder>(ENDPOINTS.workOrders.detail(id)).pipe(map((order) => this.normalizeOrder(order)));
  }

  create(order: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.api
      .post<WorkOrder>(ENDPOINTS.workOrders.list, order)
      .pipe(map((created) => this.normalizeOrder(created)));
  }

  update(id: number | string, order: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.api
      .put<WorkOrder>(ENDPOINTS.workOrders.detail(id), order)
      .pipe(map((updated) => this.normalizeOrder(updated)));
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.workOrders.detail(id));
  }

  restore(id: number | string): Observable<WorkOrder> {
    return this.api
      .post<WorkOrder>(ENDPOINTS.workOrders.restore(id), {})
      .pipe(map((order) => this.normalizeOrder(order)));
  }

  hardDelete(id: number | string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.workOrders.hardDelete(id), {});
  }

  changeStatus(id: number | string, status: string): Observable<WorkOrder> {
    return this.api
      .post<WorkOrder>(ENDPOINTS.workOrders.changeStatus(id), { status })
      .pipe(map((order) => this.normalizeOrder(order)));
  }

  assignMechanic(id: number | string, mechanicId: number): Observable<WorkOrder> {
    return this.api
      .post<WorkOrder>(ENDPOINTS.workOrders.assignMechanic(id), { mechanicId })
      .pipe(map((order) => this.normalizeOrder(order)));
  }

  addService(
    payload: Partial<WorkOrderService> & { workOrder: number; service: number }
  ): Observable<WorkOrderService> {
    return this.api.post<WorkOrderService>(ENDPOINTS.workOrders.services, payload);
  }

  deleteService(serviceId: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.workOrders.serviceDetail(serviceId));
  }

  addItem(payload: Partial<WorkOrderItem> & { workOrder: number; name: string }): Observable<WorkOrderItem> {
    return this.api.post<WorkOrderItem>(ENDPOINTS.workOrders.items, payload);
  }

  deleteItem(itemId: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.workOrders.itemDetail(itemId));
  }

  /** Reload detail after mutating nested lines (API recalculates totals). */
  refresh(id: number | string): Observable<WorkOrder> {
    return this.get(id);
  }

  /** Exported for unit tests — flattens API `totals` onto the domain model. */
  static flattenTotals(order: WorkOrder): WorkOrder {
    const totals = order.totals;
    if (totals && typeof totals === 'object') {
      return {
        ...order,
        servicesTotal: Number(totals.servicesTotal ?? order.servicesTotal ?? 0),
        itemsTotal: Number(totals.itemsTotal ?? order.itemsTotal ?? 0),
        grandTotal: Number(totals.grandTotal ?? order.grandTotal ?? 0),
      };
    }
    return {
      ...order,
      servicesTotal: Number(order.servicesTotal ?? 0),
      itemsTotal: Number(order.itemsTotal ?? 0),
      grandTotal: Number(order.grandTotal ?? 0),
    };
  }

  addServiceAndRefresh(
    orderId: number,
    payload: Omit<Partial<WorkOrderService>, 'workOrder'> & { service: number }
  ): Observable<WorkOrder> {
    return this.addService({ ...payload, workOrder: orderId }).pipe(switchMap(() => this.refresh(orderId)));
  }

  deleteServiceAndRefresh(orderId: number, serviceId: number): Observable<WorkOrder> {
    return this.deleteService(serviceId).pipe(switchMap(() => this.refresh(orderId)));
  }

  addItemAndRefresh(
    orderId: number,
    payload: Omit<Partial<WorkOrderItem>, 'workOrder'> & { name: string }
  ): Observable<WorkOrder> {
    return this.addItem({ ...payload, workOrder: orderId }).pipe(switchMap(() => this.refresh(orderId)));
  }

  deleteItemAndRefresh(orderId: number, itemId: number): Observable<WorkOrder> {
    return this.deleteItem(itemId).pipe(switchMap(() => this.refresh(orderId)));
  }

  private normalizeOrder(order: WorkOrder): WorkOrder {
    return WorkOrdersRepository.flattenTotals(order);
  }
}
