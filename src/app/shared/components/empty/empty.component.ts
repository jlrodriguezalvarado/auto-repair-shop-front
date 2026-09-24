import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';

import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-empty',
  standalone: true,
  imports: [],
  templateUrl: './empty.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./empty.component.scss'],
})
export class EmptyComponent {
  private i18n = inject(I18nService);
  message = input<string>('');
  icon = input<string>('folder_open');

  get displayMessage(): string {
    return this.message() || this.i18n.translate('common.empty');
  }
}
