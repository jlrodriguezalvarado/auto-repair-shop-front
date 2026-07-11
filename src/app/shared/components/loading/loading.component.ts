import { Component, input, inject, ChangeDetectionStrategy } from '@angular/core';

import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  private i18n = inject(I18nService);
  message = input<string>('');

  get displayMessage(): string {
    return this.message() || this.i18n.translate('common.loading');
  }
}
