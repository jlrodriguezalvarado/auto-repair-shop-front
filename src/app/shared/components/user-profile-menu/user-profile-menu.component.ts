import {
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../../core/services/auth.service';
import { PushNotificationService } from '../../../core/push/push-notification.service';
import {
  MediaPermissionKind,
  MediaPermissionService,
} from '../../services/media-permission.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-profile-menu',
  standalone: true,
  imports: [UpperCasePipe, RouterLink],
  templateUrl: './user-profile-menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-profile-menu.component.scss',
})
export class UserProfileMenuComponent implements OnInit {
  i18n = inject(I18nService);
  auth = inject(AuthService);
  push = inject(PushNotificationService);
  mediaPermissions = inject(MediaPermissionService);
  toast = inject(ToastService);
  router = inject(Router);
  menuOpen = signal(false);
  pushSubscribed = signal(false);
  pushLoading = signal(false);
  mediaPermissionLoading = signal<MediaPermissionKind | null>(null);
  pushSupported = computed(() => this.push.isSupported());
  mediaSupported = computed(() => this.mediaPermissions.isSupported());
  cameraGranted = computed(() => this.mediaPermissions.cameraState() === 'granted');
  microphoneGranted = computed(() => this.mediaPermissions.microphoneState() === 'granted');

  ngOnInit(): void {
    void this.refreshPushSubscriptionState();
    void this.mediaPermissions.refreshStates();
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-user-profile-menu-root]')) {
      this.menuOpen.set(false);
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleLang(event: MouseEvent): void {
    event.stopPropagation();
    this.i18n.toggleLanguage();
  }

  async togglePushNotifications(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    if (!this.pushSupported() || this.pushLoading()) return;
    this.pushLoading.set(true);
    try {
      if (this.pushSubscribed()) {
        const removed = await this.push.unsubscribe();
        if (removed) {
          this.toast.success(this.t('profile.pushSubscriptionRemoved'));
        }
      } else {
        const enabled = await this.push.subscribe();
        if (enabled) {
          this.toast.success(this.t('profile.pushSubscriptionSaved'));
        } else if (Notification.permission === 'denied') {
          this.toast.error(this.t('profile.notificationPermissionDenied'));
        } else {
          this.toast.error(this.t('profile.pushSubscriptionFailed'));
        }
      }
      await this.refreshPushSubscriptionState();
    } finally {
      this.pushLoading.set(false);
    }
  }

  async toggleMediaPermission(event: MouseEvent, kind: MediaPermissionKind): Promise<void> {
    event.stopPropagation();
    if (!this.mediaSupported() || this.mediaPermissionLoading()) return;
    const granted = kind === 'camera' ? this.cameraGranted() : this.microphoneGranted();
    if (granted) {
      this.toast.info(this.t('profile.mediaPermissionManageInSettings'));
      return;
    }
    const denied = this.mediaPermissions.getState(kind) === 'denied';
    if (denied) {
      this.toast.error(
        this.t(
          kind === 'camera'
            ? 'profile.cameraPermissionDeniedHint'
            : 'profile.microphonePermissionDeniedHint',
        ),
      );
      return;
    }
    this.mediaPermissionLoading.set(kind);
    try {
      const state = await this.mediaPermissions.requestPermission(kind);
      if (state === 'granted') {
        this.toast.success(
          this.t(
            kind === 'camera'
              ? 'profile.cameraPermissionGranted'
              : 'profile.microphonePermissionGranted',
          ),
        );
        return;
      }
      this.toast.error(
        this.t(
          kind === 'camera'
            ? 'profile.cameraPermissionDenied'
            : 'profile.microphonePermissionDenied',
        ),
      );
    } finally {
      this.mediaPermissionLoading.set(null);
    }
  }

  logout(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    void this.auth.logout();
  }

  private async refreshPushSubscriptionState(): Promise<void> {
    this.pushSubscribed.set(await this.push.hasActiveSubscription());
  }
}
