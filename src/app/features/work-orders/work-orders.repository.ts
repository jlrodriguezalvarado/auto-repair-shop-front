import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DeletedFilter, WorkOrder, WorkOrderService, WorkOrderItem } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkOrdersRepository {
  private api = inject(ApiService);

  list(params?: { status?: string; customer?: number | string; vehicle?: number | string; deleted?: DeletedFilter }): Observable<PaginatedResponse<WorkOrder>> {
    return this.api.get<PaginatedResponse<WorkOrder>>(ENDPOINTS.workOrders.list, params);
  }

  get(id: number | string): Observable<WorkOrder> {
    return this.api.get<WorkOrder>(ENDPOINTS.workOrders.detail(id));
  }

  create(order: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.list, order);
  }

  update(id: number | string, order: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.api.put<WorkOrder>(ENDPOINTS.workOrders.detail(id), order);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.workOrders.detail(id));
  }

  restore(id: number | string): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.restore(id), {});
  }

  hardDelete(id: number | string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.workOrders.hardDelete(id), {});
  }

  changeStatus(id: number | string, status: string): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.changeStatus(id), { status });
  }

  assignMechanic(id: number | string, mechanicId: number): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.assignMechanic(id), { assignedMechanic: mechanicId });
  }

  saveServices(id: number | string, services: WorkOrderService[]): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.services(id), services);
  }

  saveItems(id: number | string, items: WorkOrderItem[]): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.workOrders.items(id), items);
  }
}
