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

export type QueryParams = Record<string, string | number | boolean | null | undefined | unknown>;

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      const snakeParams = keysToSnake(params) as Record<string, unknown>;
      Object.keys(snakeParams).forEach((key) => {
        const value = snakeParams[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http
      .get(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(map((response) => keysToCamel(response) as T));
  }

  getBlob(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, { responseType: 'blob' });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    const snakeBody = keysToSnake(body);
    return this.http.post(`${this.baseUrl}${endpoint}`, snakeBody).pipe(map((response) => keysToCamel(response) as T));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    const snakeBody = keysToSnake(body);
    return this.http.put(`${this.baseUrl}${endpoint}`, snakeBody).pipe(map((response) => keysToCamel(response) as T));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    const snakeBody = keysToSnake(body);
    return this.http.patch(`${this.baseUrl}${endpoint}`, snakeBody).pipe(map((response) => keysToCamel(response) as T));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete(`${this.baseUrl}${endpoint}`)
      .pipe(map((response) => (response == null ? response : keysToCamel(response)) as T));
  }
}
