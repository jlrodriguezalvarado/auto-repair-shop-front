import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DashboardSummary } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardRepository {
  private api = inject(ApiService);

  getSummary(params?: { period?: string; startDate?: string; endDate?: string }): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>(ENDPOINTS.dashboard.summary, params);
  }
}
