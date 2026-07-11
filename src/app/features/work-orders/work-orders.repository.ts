import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { WorkOrder, WorkOrderService, WorkOrderItem } from '../../core/api/models';
import { normalizeWorkOrder, normalizeWorkOrderList } from '../../core/api/api-normalizers';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkOrdersRepository {
  private api = inject(ApiService);

  list(params?: { status?: string; customer?: number | string; vehicle?: number | string }): Observable<PaginatedResponse<WorkOrder>> {
    return this.api.get<PaginatedResponse<WorkOrder>>(ENDPOINTS.workOrders.list, params).pipe(
      map(response => ({
        ...response,
        results: normalizeWorkOrderList(response.results)
      }))
    );
  }

  get(id: number | string): Observable<WorkOrder> {
    return this.api.get<WorkOrder>(ENDPOINTS.workOrders.detail(id)).pipe(
      map(response => normalizeWorkOrder(response))
    );
  }

  create(order: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.list, order).pipe(
      map(response => normalizeWorkOrder(response))
    );
  }

  update(id: number | string, order: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.api.patch<WorkOrder>(ENDPOINTS.workOrders.detail(id), order).pipe(
      map(response => normalizeWorkOrder(response))
    );
  }

  delete(id: number | string): Observable<any> {
    return this.api.delete<any>(ENDPOINTS.workOrders.detail(id));
  }

  changeStatus(id: number | string, status: string): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.changeStatus(id), { status }).pipe(
      map(response => normalizeWorkOrder(response))
    );
  }

  assignMechanic(id: number | string, mechanicId: number): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.assignMechanic(id), { mechanicId }).pipe(
      map(response => normalizeWorkOrder(response))
    );
  }

  addService(payload: Partial<WorkOrderService>): Observable<WorkOrderService> {
    return this.api.post<WorkOrderService>(ENDPOINTS.workOrders.orderServices, payload);
  }

  deleteService(serviceId: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.workOrders.orderServiceDetail(serviceId));
  }

  addItem(payload: Partial<WorkOrderItem>): Observable<WorkOrderItem> {
    return this.api.post<WorkOrderItem>(ENDPOINTS.workOrders.orderItems, payload);
  }

  deleteItem(itemId: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.workOrders.orderItemDetail(itemId));
  }

  refreshOrder(id: number | string): Observable<WorkOrder> {
    return this.get(id);
  }

  addServiceAndRefresh(orderId: number | string, payload: Partial<WorkOrderService>): Observable<WorkOrder> {
    return this.addService(payload).pipe(
      switchMap(() => this.refreshOrder(orderId))
    );
  }

  deleteServiceAndRefresh(orderId: number | string, serviceId: number | string): Observable<WorkOrder> {
    return this.deleteService(serviceId).pipe(
      switchMap(() => this.refreshOrder(orderId))
    );
  }

  addItemAndRefresh(orderId: number | string, payload: Partial<WorkOrderItem>): Observable<WorkOrder> {
    return this.addItem(payload).pipe(
      switchMap(() => this.refreshOrder(orderId))
    );
  }

  deleteItemAndRefresh(orderId: number | string, itemId: number | string): Observable<WorkOrder> {
    return this.deleteItem(itemId).pipe(
      switchMap(() => this.refreshOrder(orderId))
    );
  }
}
