import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  private i18n = inject(I18nService);
  message = input<string>('');

  get displayMessage(): string {
    return this.message() || this.i18n.translate('common.loading');
  }
}
