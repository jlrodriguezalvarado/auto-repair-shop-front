import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  private activeDialog = signal<ConfirmOptions | null>(null);
  private resolveFn?: (value: boolean) => void;

  readonly dialog = this.activeDialog.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    this.activeDialog.set(options);
    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  approve(): void {
    this.activeDialog.set(null);
    if (this.resolveFn) {
      this.resolveFn(true);
    }
  }

  reject(): void {
    this.activeDialog.set(null);
    if (this.resolveFn) {
      this.resolveFn(false);
    }
  }
}
