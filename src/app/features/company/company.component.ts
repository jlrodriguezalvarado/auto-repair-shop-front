import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyRepository } from './company.repository';
import { Company } from '../../core/api/models';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent],
  templateUrl: './company.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {
  private repository = inject(CompanyRepository);
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);

  company = signal<Company | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  ngOnInit(): void {
    this.loadCompany();
  }

  private emptyCompany(): Company {
    return {
      id: 0,
      name: '',
      taxId: '',
      address: '',
      phone: '',
      secondaryPhone: '',
      email: '',
      logo: '',
      createdAt: '',
      updatedAt: ''
    };
  }

  loadCompany(): void {
    this.loading.set(true);
    this.error.set(null);
    this.repository.getDetail().subscribe({
      next: (res) => {
        this.company.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        if (err?.status === 404) {
          this.company.set(this.emptyCompany());
          this.loading.set(false);
          return;
        }
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    const data = this.company();
    if (!data) return;

    this.saving.set(true);
    this.repository.update(data).subscribe({
      next: (res) => {
        this.company.set(res);
        this.saving.set(false);
        this.toast.success(this.i18n.translate('common.success'));
      },
      error: () => {
        this.saving.set(false);
        this.toast.error(this.i18n.translate('common.error'));
      }
    });
  }
}
