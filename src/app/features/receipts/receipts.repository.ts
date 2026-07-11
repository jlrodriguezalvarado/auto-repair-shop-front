import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { Receipt, ReceiptPayment } from '../../core/api/models';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReceiptsRepository {
  private api = inject(ApiService);

  list(params?: { status?: string; customer?: number | string; vehicle?: number | string }): Observable<PaginatedResponse<Receipt>> {
    return this.api.get<PaginatedResponse<Receipt>>(ENDPOINTS.receipts.list, params);
  }

  get(id: number | string): Observable<Receipt> {
    return this.api.get<Receipt>(ENDPOINTS.receipts.detail(id));
  }

  create(receipt: Partial<Receipt>): Observable<Receipt> {
    const { services, items, payments, paidAmount, pendingAmount, code, pdfFile, issuedAt, createdAt, updatedAt, ...payload } = receipt as any;
    return this.api.post<Receipt>(ENDPOINTS.receipts.list, payload);
  }

  update(id: number | string, receipt: Partial<Receipt>): Observable<Receipt> {
    const { services, items, payments, paidAmount, pendingAmount, code, pdfFile, issuedAt, createdAt, updatedAt, ...payload } = receipt as any;
    return this.api.patch<Receipt>(ENDPOINTS.receipts.detail(id), payload);
  }

  delete(id: number | string): Observable<any> {
    return this.api.delete<any>(ENDPOINTS.receipts.detail(id));
  }

  addPayment(receiptId: number | string, payment: Partial<ReceiptPayment>): Observable<Receipt> {
    return this.api.post<Receipt>(ENDPOINTS.receipts.addPayment(receiptId), payment);
  }

  downloadPdf(id: number | string): Observable<Blob> {
    return this.api.getBlob(ENDPOINTS.receipts.pdf(id));
  }

  persistPdf(id: number | string): Observable<{ url?: string }> {
    return this.api.post<{ url?: string }>(ENDPOINTS.receipts.persistPdf(id), {});
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
