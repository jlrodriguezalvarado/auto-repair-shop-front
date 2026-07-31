import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DeletedFilter, Receipt, ReceiptPayment } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceiptsRepository {
  private api = inject(ApiService);

  list(params?: { status?: string; customer?: number | string; vehicle?: number | string; deleted?: DeletedFilter }): Observable<PaginatedResponse<Receipt>> {
    return this.api.get<PaginatedResponse<Receipt>>(ENDPOINTS.receipts.list, params);
  }

  get(id: number | string): Observable<Receipt> {
    return this.api.get<Receipt>(ENDPOINTS.receipts.detail(id));
  }

  create(receipt: Partial<Receipt>): Observable<Receipt> {
    return this.api.post<Receipt>(ENDPOINTS.receipts.list, receipt);
  }

  update(id: number | string, receipt: Partial<Receipt>): Observable<Receipt> {
    return this.api.put<Receipt>(ENDPOINTS.receipts.detail(id), receipt);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.receipts.detail(id));
  }

  restore(id: number | string): Observable<Receipt> {
    return this.api.post<Receipt>(ENDPOINTS.receipts.restore(id), {});
  }

  hardDelete(id: number | string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.receipts.hardDelete(id), {});
  }

  addPayment(receiptId: number | string, payment: Partial<ReceiptPayment>): Observable<ReceiptPayment> {
    return this.api.post<ReceiptPayment>(ENDPOINTS.receipts.payments(receiptId), payment);
  }

  getPdf(id: number | string): Observable<{ pdfFile: string }> {
    return this.api.get<{ pdfFile: string }>(ENDPOINTS.receipts.pdf(id));
  }

  persistPdf(id: number | string): Observable<Receipt> {
    return this.api.post<Receipt>(ENDPOINTS.receipts.persistPdf(id), {});
  }
}
