import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { Company, CompanyCreatePayload, DeletedFilter } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompaniesRepository {
  private api = inject(ApiService);

  list(params?: { search?: string; page?: number; deleted?: DeletedFilter }): Observable<PaginatedResponse<Company>> {
    return this.api.get<PaginatedResponse<Company>>(ENDPOINTS.companies.list, params);
  }

  get(id: number | string): Observable<Company> {
    return this.api.get<Company>(ENDPOINTS.companies.detail(id));
  }

  create(payload: CompanyCreatePayload): Observable<Company> {
    return this.api.post<Company>(ENDPOINTS.companies.list, payload);
  }

  update(id: number | string, company: Partial<Company>): Observable<Company> {
    return this.api.put<Company>(ENDPOINTS.companies.detail(id), company);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.companies.detail(id));
  }

  restore(id: number | string): Observable<Company> {
    return this.api.post<Company>(ENDPOINTS.companies.restore(id), {});
  }

  hardDelete(id: number | string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.companies.hardDelete(id), {});
  }
}
