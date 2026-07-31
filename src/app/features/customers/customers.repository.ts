import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { CustomerProfile, DeletedFilter } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomersRepository {
  private api = inject(ApiService);

  list(params?: { search?: string; isActive?: boolean; deleted?: DeletedFilter }): Observable<PaginatedResponse<CustomerProfile>> {
    return this.api.get<PaginatedResponse<CustomerProfile>>(ENDPOINTS.customers.list, params);
  }

  get(id: number | string): Observable<CustomerProfile> {
    return this.api.get<CustomerProfile>(ENDPOINTS.customers.detail(id));
  }

  create(customer: Partial<CustomerProfile>): Observable<CustomerProfile> {
    return this.api.post<CustomerProfile>(ENDPOINTS.customers.list, customer);
  }

  update(id: number | string, customer: Partial<CustomerProfile>): Observable<CustomerProfile> {
    return this.api.put<CustomerProfile>(ENDPOINTS.customers.detail(id), customer);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.customers.detail(id));
  }

  restore(id: number | string): Observable<CustomerProfile> {
    return this.api.post<CustomerProfile>(ENDPOINTS.customers.restore(id), {});
  }

  hardDelete(id: number | string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.customers.hardDelete(id), {});
  }
}
