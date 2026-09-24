import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  template: `
    @if (confirmService.dialog(); as d) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="confirmService.reject()"></div>
        <div
          class="relative bg-surface-container-lowest text-on-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/15 flex flex-col gap-4 animate-scaleUp"
        >
          <h3 class="text-xl font-bold">{{ d.title }}</h3>
          <p class="text-on-surface-variant text-sm">{{ d.message }}</p>
          <div class="flex justify-end gap-3 mt-2">
            <button
              type="button"
              (click)="confirmService.reject()"
              class="px-md py-xs text-label-sm font-semibold hover:bg-surface-container-high rounded-lg transition-colors text-primary"
            >
              {{ d.cancelText || 'Cancelar' }}
            </button>
            <button
              type="button"
              (click)="confirmService.approve()"
              class="px-md py-xs text-label-sm font-semibold btn-primary"
            >
              {{ d.confirmText || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `
      @keyframes scaleUp {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      .animate-scaleUp {
        animation: scaleUp 0.15s ease-out forwards;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  confirmService = inject(ConfirmService);
}
