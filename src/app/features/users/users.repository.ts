import { Injectable, inject } from '@angular/core';
import { ApiService, PaginatedResponse } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { User } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersRepository {
  private api = inject(ApiService);

  list(): Observable<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>(ENDPOINTS.users.list);
  }

  get(id: number | string): Observable<User> {
    return this.api.get<User>(ENDPOINTS.users.detail(id));
  }

  update(id: number | string, user: Partial<User>): Observable<User> {
    return this.api.put<User>(ENDPOINTS.users.detail(id), user);
  }
}
