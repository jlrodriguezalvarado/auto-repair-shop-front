import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DashboardSummary } from '../../core/api/models';
import { mapDashboardPeriod, normalizeDashboardSummary } from '../../core/api/api-normalizers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardRepository {
  private api = inject(ApiService);

  getSummary(params?: { period?: string; startDate?: string; endDate?: string }): Observable<DashboardSummary> {
    const query: Record<string, string> = {};
    const mappedPeriod = mapDashboardPeriod(params?.period);
    if (mappedPeriod) {
      query['period'] = mappedPeriod;
    }
    if (params?.startDate) {
      query['startDate'] = params.startDate;
    }
    if (params?.endDate) {
      query['endDate'] = params.endDate;
    }
    return this.api.get<DashboardSummary>(ENDPOINTS.dashboard.summary, query).pipe(
      map(response => normalizeDashboardSummary(response))
    );
  }
}
