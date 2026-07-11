import { Component, input, Output, inject, EventEmitter } from '@angular/core';

import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  private i18n = inject(I18nService);
  message = input<string>('');

  @Output() retry = new EventEmitter<void>();

  get displayMessage(): string {
    return this.message() || this.i18n.translate('common.error');
  }

  get retryLabel(): string {
    return this.i18n.translate('common.retry');
  }

  onRetry(): void {
    this.retry.emit();
  }
}
