import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { keysToCamel, keysToSnake } from './case-mapper';
import { environment } from '../../../environments/environment';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      const snakeParams = keysToSnake(params);
      Object.keys(snakeParams).forEach(key => {
        if (snakeParams[key] !== undefined && snakeParams[key] !== null) {
          httpParams = httpParams.set(key, String(snakeParams[key]));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams }).pipe(
      map(response => keysToCamel(response))
    );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const snakeBody = keysToSnake(body);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, snakeBody).pipe(
      map(response => keysToCamel(response))
    );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const snakeBody = keysToSnake(body);
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, snakeBody).pipe(
      map(response => keysToCamel(response))
    );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    const snakeBody = keysToSnake(body);
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, snakeBody).pipe(
      map(response => keysToCamel(response))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`).pipe(
      map(response => (response == null ? response : keysToCamel(response)))
    );
  }
}
