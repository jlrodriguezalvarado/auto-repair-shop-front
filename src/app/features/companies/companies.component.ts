import { Component, inject, signal, OnInit, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompaniesRepository } from './companies.repository';
import { Company, DeletedFilter } from '../../core/api/models';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { ErrorComponent } from '../../shared/components/error/error.component';
import { EmptyComponent } from '../../shared/components/empty/empty.component';
import { DialogFormDirective } from '../../shared/directives/dialog-form.directive';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent, ErrorComponent, EmptyComponent, DialogFormDirective],
  templateUrl: './companies.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit {
  private repository = inject(CompaniesRepository);
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);
  companies = signal<Company[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  searchQuery = '';
  deletedFilter: DeletedFilter = 'false';
  companyDialog = viewChild.required<DialogFormDirective>('companyModalDirective');
  modalTitle = signal('');
  editingId = signal<number | null>(null);
  formModel = {
    name: '',
    taxId: '',
    address: '',
    phone: '',
    secondaryPhone: '',
    email: '',
    logo: '',
    adminUsername: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  };

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: { search?: string; deleted?: DeletedFilter } = { deleted: this.deletedFilter };
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    this.repository.list(params).subscribe({
      next: (res) => {
        this.companies.set(res.results ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.i18n.translate('common.error'));
        this.loading.set(false);
      },
    });
  }

  viewCompany(company: Company): void {
    this.auth.enterCompanyView({ id: company.id, name: company.name });
  }

  openCreateModal(): void {
    this.modalTitle.set(this.i18n.translate('companies.createTitle'));
    this.editingId.set(null);
    this.formModel = {
      name: '',
      taxId: '',
      address: '',
      phone: '',
      secondaryPhone: '',
      email: '',
      logo: '',
      adminUsername: '',
      adminEmail: '',
      adminPassword: '',
      adminFirstName: '',
      adminLastName: '',
    };
    this.companyDialog().open();
  }

  openEditModal(company: Company, event: Event): void {
    event.stopPropagation();
    this.modalTitle.set(this.i18n.translate('companies.editTitle'));
    this.editingId.set(company.id);
    this.formModel = {
      name: company.name,
      taxId: company.taxId,
      address: company.address,
      phone: company.phone,
      secondaryPhone: company.secondaryPhone || '',
      email: company.email,
      logo: company.logo || '',
      adminUsername: '',
      adminEmail: '',
      adminPassword: '',
      adminFirstName: '',
      adminLastName: '',
    };
    this.companyDialog().open();
  }

  saveCompany(): void {
    const f = this.formModel;
    if (!f.name || !f.taxId || !f.address || !f.phone || !f.email) {
      this.toast.error(this.i18n.translate('validation.required'));
      return;
    }
    const id = this.editingId();
    if (!id) {
      if (!f.adminUsername || !f.adminEmail || !f.adminPassword) {
        this.toast.error(this.i18n.translate('companies.adminRequired'));
        return;
      }
    }
    this.saving.set(true);
    if (id) {
      this.repository
        .update(id, {
          name: f.name,
          taxId: f.taxId,
          address: f.address,
          phone: f.phone,
          secondaryPhone: f.secondaryPhone || undefined,
          email: f.email,
          logo: f.logo || undefined,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.toast.success(this.i18n.translate('common.success'));
            this.companyDialog().close();
            this.loadCompanies();
          },
          error: () => {
            this.saving.set(false);
            this.toast.error(this.i18n.translate('common.error'));
          },
        });
      return;
    }
    this.repository
      .create({
        name: f.name,
        taxId: f.taxId,
        address: f.address,
        phone: f.phone,
        secondaryPhone: f.secondaryPhone || undefined,
        email: f.email,
        logo: f.logo || undefined,
        adminUser: {
          username: f.adminUsername,
          email: f.adminEmail,
          password: f.adminPassword,
          firstName: f.adminFirstName || undefined,
          lastName: f.adminLastName || undefined,
        },
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success(this.i18n.translate('common.success'));
          this.companyDialog().close();
          this.loadCompanies();
        },
        error: () => {
          this.saving.set(false);
          this.toast.error(this.i18n.translate('common.error'));
        },
      });
  }

  deleteCompany(company: Company, event: Event): void {
    event.stopPropagation();
    this.confirm
      .confirm({
        title: this.i18n.translate('softDelete.confirmTitle'),
        message: this.i18n.translate('softDelete.confirmMessage', { name: company.name }),
        confirmText: this.i18n.translate('actions.delete'),
      })
      .then((approved) => {
        if (approved) {
          this.repository.delete(company.id).subscribe({
            next: () => {
              this.toast.success(this.i18n.translate('softDelete.deletedSuccess'));
              this.loadCompanies();
            },
            error: () => this.toast.error(this.i18n.translate('softDelete.deleteFailed')),
          });
        }
      });
  }

  restoreCompany(company: Company, event: Event): void {
    event.stopPropagation();
    this.confirm
      .confirm({
        title: this.i18n.translate('softDelete.restoreTitle'),
        message: this.i18n.translate('softDelete.restoreMessage', { name: company.name }),
        confirmText: this.i18n.translate('actions.restore'),
      })
      .then((approved) => {
        if (approved) {
          this.repository.restore(company.id).subscribe({
            next: () => {
              this.toast.success(this.i18n.translate('softDelete.restoredSuccess'));
              this.loadCompanies();
            },
            error: () => this.toast.error(this.i18n.translate('softDelete.restoreFailed')),
          });
        }
      });
  }

  hardDeleteCompany(company: Company, event: Event): void {
    event.stopPropagation();
    this.confirm
      .confirm({
        title: this.i18n.translate('softDelete.hardDeleteTitle'),
        message: this.i18n.translate('softDelete.hardDeleteMessage', { name: company.name }),
        confirmText: this.i18n.translate('actions.hardDelete'),
      })
      .then((approved) => {
        if (approved) {
          this.repository.hardDelete(company.id).subscribe({
            next: () => {
              this.toast.success(this.i18n.translate('softDelete.hardDeleteSuccess'));
              this.loadCompanies();
            },
            error: () => this.toast.error(this.i18n.translate('softDelete.hardDeleteFailed')),
          });
        }
      });
  }
}
