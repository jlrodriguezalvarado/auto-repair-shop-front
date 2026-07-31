import { Injectable, inject, signal } from '@angular/core';
import { NotificationsRepository, AppNotification } from './notifications.repository';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly repo = inject(NotificationsRepository);
  readonly items = signal<AppNotification[]>([]);
  readonly unreadCount = signal(0);
  readonly loading = signal(false);

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const [list, count] = await Promise.all([
        firstValueFrom(this.repo.list({ isRead: false, page: 1 })),
        firstValueFrom(this.repo.unreadCount()),
      ]);
      this.items.set(list.results ?? []);
      this.unreadCount.set(count);
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      this.loading.set(false);
    }
  }

  async markRead(id: number | string): Promise<void> {
    await firstValueFrom(this.repo.markRead(id));
    await this.refresh();
  }

  async markAllRead(): Promise<void> {
    await firstValueFrom(this.repo.markAllRead());
    await this.refresh();
  }
}
