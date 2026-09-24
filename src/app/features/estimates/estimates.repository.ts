import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DeletedFilter, Estimate, PersistPdfResponse, WorkOrder } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EstimatesRepository {
  private api = inject(ApiService);

  list(params?: {
    status?: string;
    customer?: number | string;
    vehicle?: number | string;
    deleted?: DeletedFilter;
  }): Observable<PaginatedResponse<Estimate>> {
    return this.api.get<PaginatedResponse<Estimate>>(ENDPOINTS.estimates.list, params);
  }

  get(id: number | string): Observable<Estimate> {
    return this.api.get<Estimate>(ENDPOINTS.estimates.detail(id));
  }

  create(estimate: Partial<Estimate>): Observable<Estimate> {
    return this.api.post<Estimate>(ENDPOINTS.estimates.list, estimate);
  }

  update(id: number | string, estimate: Partial<Estimate>): Observable<Estimate> {
    return this.api.put<Estimate>(ENDPOINTS.estimates.detail(id), estimate);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.estimates.detail(id));
  }

  restore(id: number | string): Observable<Estimate> {
    return this.api.post<Estimate>(ENDPOINTS.estimates.restore(id), {});
  }

  hardDelete(id: number | string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.estimates.hardDelete(id), {});
  }

  approve(id: number | string): Observable<Estimate> {
    return this.api.post<Estimate>(ENDPOINTS.estimates.approve(id), {});
  }

  reject(id: number | string): Observable<Estimate> {
    return this.api.post<Estimate>(ENDPOINTS.estimates.reject(id), {});
  }

  createWorkOrder(id: number | string): Observable<WorkOrder> {
    return this.api.post<WorkOrder>(ENDPOINTS.estimates.createWorkOrder(id), {});
  }

  getPdf(id: number | string): Observable<Blob> {
    return this.api.getBlob(ENDPOINTS.estimates.pdf(id));
  }

  persistPdf(id: number | string): Observable<PersistPdfResponse> {
    return this.api.post<PersistPdfResponse>(ENDPOINTS.estimates.persistPdf(id), {});
  }
}
