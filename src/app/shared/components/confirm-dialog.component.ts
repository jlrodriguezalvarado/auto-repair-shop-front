import { Component, inject } from '@angular/core';

import { ConfirmService } from '../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  template: `
    @if (confirmService.dialog(); as d) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="confirmService.reject()"></div>
        <!-- Card -->
        <div class="relative bg-md-surface text-md-on-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-md-outline/15 flex flex-col gap-4 animate-scaleUp">
          <h3 class="text-xl font-bold">{{ d.title }}</h3>
          <p class="text-md-on-surface-variant text-sm">{{ d.message }}</p>
          <div class="flex justify-end gap-3 mt-2">
            <button
              type="button"
              (click)="confirmService.reject()"
              class="px-4 py-2 text-sm font-semibold hover:bg-md-surface-variant/50 rounded-lg transition-colors text-md-primary">
              {{ d.cancelText || 'Cancelar' }}
            </button>
            <button
              type="button"
              (click)="confirmService.approve()"
              class="px-4 py-2 text-sm font-semibold bg-md-primary hover:bg-md-primary/95 text-md-on-primary rounded-lg transition-colors">
              {{ d.confirmText || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
    `,
  styles: [`
    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-scaleUp {
      animation: scaleUp 0.15s ease-out forwards;
    }
  `]
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);
}
