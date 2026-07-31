import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DashboardRepository } from './dashboard.repository';
import { DashboardSummary } from '../../core/api/models';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingComponent, ErrorComponent],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private repository = inject(DashboardRepository);
  auth = inject(AuthService);
  i18n = inject(I18nService);

  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  selectedPeriod = signal<'today' | 'week' | 'month' | 'custom'>('month');
  customStartDate = '';
  customEndDate = '';

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: any = { period: this.selectedPeriod() };
    if (this.selectedPeriod() === 'custom') {
      params.startDate = this.customStartDate;
      params.endDate = this.customEndDate;
    }
    this.repository.getSummary(params).subscribe({
      next: (res) => {
        this.summary.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  onPeriodChange(period: 'today' | 'week' | 'month' | 'custom'): void {
    this.selectedPeriod.set(period);
    if (period !== 'custom') {
      this.loadSummary();
    }
  }

  onCustomRangeSubmit(): void {
    this.loadSummary();
  }

  getServiceBarWidth(count: number, services: { count: number }[]): number {
    const max = Math.max(...services.map(s => s.count), 1);
    return Math.round((count / max) * 100);
  }
}
