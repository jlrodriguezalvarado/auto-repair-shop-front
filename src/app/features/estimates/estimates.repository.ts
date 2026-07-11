import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { Estimate } from '../../core/api/models';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstimatesRepository {
  private api = inject(ApiService);

  list(params?: { status?: string; customer?: number | string; vehicle?: number | string }): Observable<PaginatedResponse<Estimate>> {
    return this.api.get<PaginatedResponse<Estimate>>(ENDPOINTS.estimates.list, params);
  }

  get(id: number | string): Observable<Estimate> {
    return this.api.get<Estimate>(ENDPOINTS.estimates.detail(id));
  }

  create(estimate: Partial<Estimate>): Observable<Estimate> {
    const { services, items, subtotal, taxAmount, total, ...payload } = estimate as any;
    return this.api.post<Estimate>(ENDPOINTS.estimates.list, payload);
  }

  update(id: number | string, estimate: Partial<Estimate>): Observable<Estimate> {
    const { services, items, subtotal, taxAmount, total, code, createdAt, updatedAt, pdfFile, ...payload } = estimate as any;
    return this.api.patch<Estimate>(ENDPOINTS.estimates.detail(id), payload);
  }

  delete(id: number | string): Observable<any> {
    return this.api.delete<any>(ENDPOINTS.estimates.detail(id));
  }

  approve(id: number | string): Observable<Estimate> {
    return this.api.post<Estimate>(ENDPOINTS.estimates.approve(id), {});
  }

  reject(id: number | string): Observable<Estimate> {
    return this.api.patch<Estimate>(ENDPOINTS.estimates.detail(id), { status: 'rejected' });
  }

  createWorkOrder(id: number | string): Observable<{ workOrderId: number }> {
    return this.api.post<{ workOrderId: number }>(ENDPOINTS.estimates.createWorkOrder(id), {});
  }

  addService(payload: {
    estimate: number;
    service: number;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }): Observable<any> {
    return this.api.post(ENDPOINTS.estimates.estimateServices, payload);
  }

  addServiceAndRefresh(estimateId: number | string, payload: {
    estimate: number;
    service: number;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }): Observable<Estimate> {
    return this.addService(payload).pipe(
      switchMap(() => this.get(estimateId))
    );
  }

  downloadPdf(id: number | string): Observable<Blob> {
    return this.api.getBlob(ENDPOINTS.estimates.pdf(id));
  }

  persistPdf(id: number | string): Observable<{ url?: string }> {
    return this.api.post<{ url?: string }>(ENDPOINTS.estimates.persistPdf(id), {});
  }

  openPdf(id: number | string): Observable<void> {
    return this.downloadPdf(id).pipe(
      tap(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }),
      map(() => undefined)
    );
  }
}
