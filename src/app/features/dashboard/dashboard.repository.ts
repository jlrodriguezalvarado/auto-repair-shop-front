import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DashboardSummary } from '../../core/api/models';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardRepository {
  private api = inject(ApiService);

  getSummary(params?: { period?: string; startDate?: string; endDate?: string }): Observable<DashboardSummary> {
    const apiParams = this.toApiParams(params);
    return this.api.get<Record<string, any>>(ENDPOINTS.dashboard.summary, apiParams).pipe(
      map((raw) => this.normalize(raw))
    );
  }

  private toApiParams(params?: { period?: string; startDate?: string; endDate?: string }): Record<string, string> | undefined {
    if (!params) return undefined;
    const periodMap: Record<string, string> = {
      today: 'today',
      week: 'current_week',
      month: 'current_month',
    };
    const out: Record<string, string> = {};
    if (params.period && params.period !== 'custom') {
      out['period'] = periodMap[params.period] ?? params.period;
    }
    if (params.startDate) out['startDate'] = params.startDate;
    if (params.endDate) out['endDate'] = params.endDate;
    return out;
  }

  private normalize(raw: Record<string, any>): DashboardSummary {
    const debtorsRaw = (raw['customersWithDebt'] ?? raw['debtors'] ?? []) as any[];
    const topServicesRaw = (raw['topServices'] ?? []) as any[];
    const recentPaymentsRaw = (raw['recentPayments'] ?? []) as any[];
    const ordersByStatus = (raw['workOrdersByStatus'] ?? raw['ordersByStatus'] ?? []) as { status: string; count: number }[];
    const receiptsByStatus = (raw['receiptsByStatus'] ?? []) as { status: string; count: number }[];
    const debtors = debtorsRaw.map((d, index) => ({
      id: d.id ?? index,
      name: d.name ?? `${d.customerFirstName ?? d.customer_FirstName ?? ''} ${d.customerLastName ?? d.customer_LastName ?? ''}`.trim(),
      debt: Number(d.debt ?? d.pendingAmount ?? 0),
    }));
    return {
      carsServiced: Number(raw['vehiclesServedCount'] ?? raw['vehiclesServicedCount'] ?? raw['carsServiced'] ?? 0),
      pendingReceiptsCount: Number(raw['pendingReceiptsCount'] ?? 0),
      totalToCollect: Number(raw['pendingReceiptsTotal'] ?? raw['totalToCollect'] ?? 0),
      incomeReceived: Number(raw['receivedIncomeTotal'] ?? raw['incomeReceived'] ?? 0),
      workOrdersCount: Number(raw['workOrdersCount'] ?? 0),
      debtorCustomersCount: Number(raw['debtorCustomersCount'] ?? debtors.length),
      ordersByStatus,
      receiptsByStatus,
      topServices: topServicesRaw.map((s) => ({
        name: String(s.name ?? s.nameSnapshot ?? ''),
        count: Number(s.count ?? 0),
      })),
      recentPayments: recentPaymentsRaw.map((p) => ({
        id: Number(p.id ?? 0),
        amount: Number(p.amount ?? 0),
        date: String(p.date ?? p.paymentDate ?? ''),
        customerName: String(p.customerName ?? p.receiptCode ?? p.receipt_Code ?? ''),
      })),
      debtors,
    };
  }
}
