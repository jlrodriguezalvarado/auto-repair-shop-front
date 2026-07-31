import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../core/notifications/notifications.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-40" (click)="close()"></div>
      <div class="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-hidden rounded-xl bg-surface shadow-elevated border border-outline-variant/20 flex flex-col">
        <div class="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
          <span class="font-bold text-sm">Notificaciones</span>
          <button class="text-xs text-primary font-semibold" (click)="markAll()">Marcar todas</button>
        </div>
        <div class="overflow-y-auto flex-1">
          @if (notifications.loading()) {
            <p class="p-4 text-sm text-outline">Cargando…</p>
          } @else if (notifications.items().length === 0) {
            <p class="p-4 text-sm text-outline">Sin notificaciones nuevas</p>
          } @else {
            @for (item of notifications.items(); track item.id) {
              <button
                class="w-full text-left px-4 py-3 hover:bg-surface-container-high border-b border-outline-variant/10"
                (click)="openItem(item)">
                <div class="text-sm font-semibold text-on-surface">{{ item.title }}</div>
                <div class="text-xs text-outline mt-0.5">{{ item.body }}</div>
                <div class="text-[10px] text-outline mt-1">{{ item.createdAt | date:'short' }}</div>
              </button>
            }
          }
        </div>
      </div>
    }
  `,
})
export class NotificationPanelComponent implements OnInit {
  notifications = inject(NotificationsService);
  private router = inject(Router);
  open = signal(false);

  ngOnInit(): void {
    void this.notifications.refresh();
  }

  toggle(): void {
    this.open.update((v) => !v);
    if (this.open()) {
      void this.notifications.refresh();
    }
  }

  close(): void {
    this.open.set(false);
  }

  async markAll(): Promise<void> {
    await this.notifications.markAllRead();
  }

  async openItem(item: { id: number | string; data: Record<string, unknown> }): Promise<void> {
    await this.notifications.markRead(item.id);
    this.close();
    const url = typeof item.data?.['url'] === 'string' ? item.data['url'] : null;
    if (url) {
      void this.router.navigateByUrl(url);
    }
  }
}
