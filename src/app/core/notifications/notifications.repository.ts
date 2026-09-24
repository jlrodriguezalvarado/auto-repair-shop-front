import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../api/api.service';
import { ENDPOINTS } from '../api/endpoints';

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
  platform?: string;
}

export interface AppNotification {
  id: number | string;
  notificationType: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsRepository {
  private readonly api = inject(ApiService);

  list(params: Record<string, unknown> = {}): Observable<{ count: number; results: AppNotification[] }> {
    return this.api.get<{ count: number; results: AppNotification[] }>(ENDPOINTS.notifications.list, params);
  }

  unreadCount(): Observable<number> {
    return this.api
      .get<{ unreadCount: number }>(ENDPOINTS.notifications.unreadCount)
      .pipe(map((res) => res.unreadCount ?? 0));
  }

  markRead(id: number | string): Observable<AppNotification> {
    return this.api.post<AppNotification>(ENDPOINTS.notifications.markRead(id), {});
  }

  markAllRead(): Observable<number> {
    return this.api
      .post<{ updatedCount: number }>(ENDPOINTS.notifications.markAllRead, {})
      .pipe(map((res) => res.updatedCount ?? 0));
  }

  getVapidPublicKey(): Observable<string> {
    return this.api.get<Record<string, unknown>>(ENDPOINTS.notifications.pushSubscriptions.vapidPublicKey).pipe(
      map((response) => {
        if (typeof response === 'string') return response;
        return String(response['publicKey'] ?? response['public_key'] ?? '');
      })
    );
  }

  savePushSubscription(payload: PushSubscriptionPayload): Observable<void> {
    return this.api.post<void>(ENDPOINTS.notifications.pushSubscriptions.create, {
      endpoint: payload.endpoint,
      keys: payload.keys,
      userAgent: payload.userAgent,
      platform: payload.platform,
    });
  }

  unsubscribePushSubscription(endpoint: string): Observable<void> {
    return this.api.post<void>(ENDPOINTS.notifications.pushSubscriptions.unsubscribe, { endpoint });
  }
}
