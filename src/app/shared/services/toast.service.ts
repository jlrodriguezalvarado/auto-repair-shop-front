import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private static counter = 0;
  private toastList = signal<ToastMessage[]>([]);

  readonly toasts = this.toastList.asReadonly();

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  private add(message: string, type: ToastType): void {
    const id = ++ToastService.counter;
    this.toastList.update((list) => [...list, { id, message, type }]);

    // Auto remove after 4s
    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  remove(id: number): void {
    this.toastList.update((list) => list.filter((toast) => toast.id !== id));
  }
}
