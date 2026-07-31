import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { DeletedFilter, Vehicle } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiclesRepository {
  private api = inject(ApiService);

  list(params?: { search?: string; customer?: number | string; deleted?: DeletedFilter }): Observable<PaginatedResponse<Vehicle>> {
    return this.api.get<PaginatedResponse<Vehicle>>(ENDPOINTS.vehicles.list, params);
  }

  get(id: number | string): Observable<Vehicle> {
    return this.api.get<Vehicle>(ENDPOINTS.vehicles.detail(id));
  }

  create(vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.api.post<Vehicle>(ENDPOINTS.vehicles.list, vehicle);
  }

  update(id: number | string, vehicle: Partial<Vehicle>): Observable<Vehicle> {
    return this.api.put<Vehicle>(ENDPOINTS.vehicles.detail(id), vehicle);
  }

  delete(id: number | string): Observable<void> {
    return this.api.delete<void>(ENDPOINTS.vehicles.detail(id));
  }

  restore(id: number | string): Observable<Vehicle> {
    return this.api.post<Vehicle>(ENDPOINTS.vehicles.restore(id), {});
  }

  hardDelete(id: number | string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.vehicles.hardDelete(id), {});
  }
}
