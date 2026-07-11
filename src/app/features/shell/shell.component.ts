import { Component, inject } from '@angular/core';

import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);

  get menuItems() {
    const items = [
      { path: '/dashboard', label: this.i18n.translate('nav.dashboard'), icon: 'dashboard', roles: ['Administrator', 'Secretary', 'Mechanic', 'Customer'] },
      { path: '/company', label: this.i18n.translate('nav.company'), icon: 'business', roles: ['Administrator', 'Secretary'] },
      { path: '/customers', label: this.i18n.translate('nav.customers'), icon: 'group', roles: ['Administrator', 'Secretary'] },
      { path: '/vehicles', label: this.i18n.translate('nav.vehicles'), icon: 'directions_car', roles: ['Administrator', 'Secretary', 'Mechanic', 'Customer'] },
      { path: '/service-catalog', label: this.i18n.translate('nav.serviceCatalog'), icon: 'build', roles: ['Administrator', 'Secretary'] },
      { path: '/work-orders', label: this.i18n.translate('nav.workOrders'), icon: 'assignment', roles: ['Administrator', 'Secretary', 'Mechanic', 'Customer'] },
      { path: '/estimates', label: this.i18n.translate('nav.estimates'), icon: 'receipt_long', roles: ['Administrator', 'Secretary', 'Customer'] },
      { path: '/receipts', label: this.i18n.translate('nav.receipts'), icon: 'payments', roles: ['Administrator', 'Secretary', 'Customer'] },
      { path: '/users', label: this.i18n.translate('nav.users'), icon: 'manage_accounts', roles: ['Administrator'] }
    ];

    const currentRole = this.auth.user()?.role || '';
    return items.filter(item => item.roles.includes(currentRole));
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  logout(): void {
    this.auth.logout();
  }
}
