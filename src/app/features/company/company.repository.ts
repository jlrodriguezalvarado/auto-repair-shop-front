import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ENDPOINTS } from '../../core/api/endpoints';
import { Company } from '../../core/api/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompanyRepository {
  private api = inject(ApiService);

  getDetail(): Observable<Company> {
    return this.api.get<Company>(ENDPOINTS.company.detail);
  }

  update(company: Partial<Company>): Observable<Company> {
    return this.api.put<Company>(ENDPOINTS.company.update, company);
  }
}
