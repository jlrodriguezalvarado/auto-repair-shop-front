import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <div
        *ngFor="let toast of toastService.toasts()"
        [ngClass]="{
          'bg-green-600 text-white': toast.type === 'success',
          'bg-red-600 text-white': toast.type === 'error',
          'bg-blue-600 text-white': toast.type === 'info'
        }"
        class="flex items-center justify-between p-4 rounded-lg shadow-lg border border-black/10 transition-all duration-300">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>
        <button (click)="toastService.remove(toast.id)" class="text-white hover:opacity-75 transition-opacity">
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
