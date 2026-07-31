import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { I18nService } from '../../core/services/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import {
  MediaPermissionKind,
  MediaPermissionService,
} from '../../shared/services/media-permission.service';

const API_FIELD_TO_CONTROL: Record<string, string> = {
  current_password: 'currentPassword',
  new_password: 'newPassword',
  confirm_password: 'confirmPassword',
  currentPassword: 'currentPassword',
  newPassword: 'newPassword',
  confirmPassword: 'confirmPassword',
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  i18n = inject(I18nService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  mediaPermissions = inject(MediaPermissionService);
  userEmail = signal('');
  userUsername = signal('');
  passwordSaving = signal(false);
  mediaPermissionLoading = signal<MediaPermissionKind | null>(null);
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    const user = this.auth.user();
    this.userEmail.set(user?.email ?? '');
    this.userUsername.set(user?.username ?? '');
    void this.mediaPermissions.refreshStates();
  }

  t(key: string): string {
    return this.i18n.translate(key);
  }

  mediaPermissionLabel(kind: MediaPermissionKind): string {
    const state = this.mediaPermissions.getState(kind);
    if (state === 'granted') {
      return kind === 'camera' ? this.t('profile.cameraAccess') : this.t('profile.microphoneAccess');
    }
    if (state === 'denied') {
      return kind === 'camera'
        ? this.t('profile.cameraPermissionDenied')
        : this.t('profile.microphonePermissionDenied');
    }
    return kind === 'camera' ? this.t('profile.enableCamera') : this.t('profile.enableMicrophone');
  }

  async requestMediaPermission(kind: MediaPermissionKind): Promise<void> {
    if (!this.mediaPermissions.isSupported() || this.mediaPermissionLoading()) return;
    if (this.mediaPermissions.isGranted(kind)) {
      this.toast.info(this.t('profile.mediaPermissionManageInSettings'));
      return;
    }
    if (this.mediaPermissions.getState(kind) === 'denied') {
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

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword.update((value) => !value);
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  fieldError(controlName: 'currentPassword' | 'newPassword' | 'confirmPassword'): string | null {
    const control = this.passwordForm.get(controlName);
    if (!control || (!control.touched && !control.dirty)) return null;
    if (control.errors?.['api']) return control.errors['api'] as string;
    if (controlName === 'confirmPassword' && control.errors?.['passwordMismatch']) {
      return this.t('profile.passwordsDoNotMatch');
    }
    if (control.errors?.['required']) {
      return this.t('validation.required');
    }
    return null;
  }

  savePassword(): void {
    if (this.passwordSaving()) return;
    this.clearApiFieldErrors();
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.passwordForm.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      this.passwordForm.get('confirmPassword')?.markAsTouched();
      return;
    }
    this.passwordSaving.set(true);
    this.auth
      .changePassword({ currentPassword, newPassword, confirmPassword })
      .subscribe({
        next: (response) => {
          this.passwordSaving.set(false);
          this.passwordForm.reset();
          this.toast.success(response.detail || this.t('profile.passwordChanged'));
          void this.auth.logout();
        },
        error: (error: unknown) => {
          this.passwordSaving.set(false);
          if (!(error instanceof HttpErrorResponse)) {
            this.toast.error(this.t('profile.passwordChangeFailed'));
            return;
          }
          if (error.status === 400) {
            this.applyApiFieldErrors(error.error);
            return;
          }
          if (error.status === 401) {
            void this.auth.logout();
            return;
          }
          this.toast.error(this.t('profile.passwordChangeFailed'));
        },
      });
  }

  private clearApiFieldErrors(): void {
    for (const controlName of ['currentPassword', 'newPassword', 'confirmPassword'] as const) {
      const control = this.passwordForm.get(controlName);
      if (!control?.errors?.['api']) continue;
      const { api: _, ...rest } = control.errors;
      control.setErrors(Object.keys(rest).length ? rest : null);
    }
  }

  private applyApiFieldErrors(body: unknown): void {
    if (!body || typeof body !== 'object') {
      this.toast.error(this.t('profile.passwordChangeFailed'));
      return;
    }
    let hasFieldError = false;
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      const controlName = API_FIELD_TO_CONTROL[key];
      if (!controlName) continue;
      const control = this.passwordForm.get(controlName);
      if (!control) continue;
      const message = Array.isArray(value) ? value.join(' ') : String(value);
      control.setErrors({ api: message });
      control.markAsTouched();
      hasFieldError = true;
    }
    if (!hasFieldError) {
      this.toast.error(this.t('profile.passwordChangeFailed'));
    }
  }
}
