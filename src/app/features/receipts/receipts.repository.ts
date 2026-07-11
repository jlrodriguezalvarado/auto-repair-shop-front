import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { Receipt, ReceiptPayment } from '../../core/api/models';
import { Observable } from 'rxjs';

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
    return this.api.post<Receipt>(ENDPOINTS.receipts.list, receipt);
  }

  update(id: number | string, receipt: Partial<Receipt>): Observable<Receipt> {
    return this.api.put<Receipt>(ENDPOINTS.receipts.detail(id), receipt);
  }

  delete(id: number | string): Observable<any> {
    return this.api.delete<any>(ENDPOINTS.receipts.detail(id));
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
