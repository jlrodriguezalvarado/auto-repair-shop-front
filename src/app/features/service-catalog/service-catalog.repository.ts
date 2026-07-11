import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { ServiceCatalog } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceCatalogRepository {
  private api = inject(ApiService);

  list(params?: { search?: string; isActive?: boolean }): Observable<PaginatedResponse<ServiceCatalog>> {
    return this.api.get<PaginatedResponse<ServiceCatalog>>(ENDPOINTS.serviceCatalog.list, params);
  }

  get(id: number | string): Observable<ServiceCatalog> {
    return this.api.get<ServiceCatalog>(ENDPOINTS.serviceCatalog.detail(id));
  }

  create(service: Partial<ServiceCatalog>): Observable<ServiceCatalog> {
    return this.api.post<ServiceCatalog>(ENDPOINTS.serviceCatalog.list, service);
  }

  update(id: number | string, service: Partial<ServiceCatalog>): Observable<ServiceCatalog> {
    return this.api.put<ServiceCatalog>(ENDPOINTS.serviceCatalog.detail(id), service);
  }

  delete(id: number | string): Observable<any> {
    return this.api.delete<any>(ENDPOINTS.serviceCatalog.detail(id));
  }
}
