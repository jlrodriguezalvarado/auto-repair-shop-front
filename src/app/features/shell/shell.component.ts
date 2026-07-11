import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private router = inject(Router);
  pageTitle = signal('Dashboard');
  mobileNavOpen = signal(false);

  private readonly routeTitleKeys: Record<string, string> = {
    '/dashboard': 'nav.dashboard',
    '/company': 'nav.company',
    '/customers': 'nav.customers',
    '/vehicles': 'nav.vehicles',
    '/service-catalog': 'nav.serviceCatalog',
    '/work-orders': 'nav.workOrders',
    '/estimates': 'nav.estimates',
    '/receipts': 'nav.receipts',
    '/users': 'nav.users',
  };

  private readonly mobileNavPaths = ['/dashboard', '/vehicles', '/work-orders', '/receipts'];

  constructor() {
    this.updatePageTitle(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(e => {
      this.updatePageTitle((e as NavigationEnd).urlAfterRedirects);
      this.mobileNavOpen.set(false);
    });
  }

  get menuItems() {
    const items = [
      { path: '/dashboard', label: this.i18n.translate('nav.dashboard'), icon: 'dashboard', roles: ['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'] },
      { path: '/users', label: this.i18n.translate('nav.users'), icon: 'group', roles: ['ADMIN'] },
      { path: '/company', label: this.i18n.translate('nav.company'), icon: 'business', roles: ['ADMIN', 'SECRETARY'] },
      { path: '/customers', label: this.i18n.translate('nav.customers'), icon: 'person', roles: ['ADMIN', 'SECRETARY'] },
      { path: '/vehicles', label: this.i18n.translate('nav.vehicles'), icon: 'directions_car', roles: ['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'] },
      { path: '/service-catalog', label: this.i18n.translate('nav.serviceCatalog'), icon: 'inventory_2', roles: ['ADMIN', 'SECRETARY'] },
      { path: '/work-orders', label: this.i18n.translate('nav.workOrders'), icon: 'build', roles: ['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'] },
      { path: '/estimates', label: this.i18n.translate('nav.estimates'), icon: 'request_quote', roles: ['ADMIN', 'SECRETARY', 'CUSTOMER'] },
      { path: '/receipts', label: this.i18n.translate('nav.receipts'), icon: 'receipt_long', roles: ['ADMIN', 'SECRETARY', 'CUSTOMER'] },
    ];
    const currentRole = this.auth.user()?.role || '';
    return items.filter(item => item.roles.includes(currentRole));
  }

  get mobileNavItems() {
    const items = this.menuItems.filter(item => this.mobileNavPaths.includes(item.path));
    return items.length > 0 ? items : this.menuItems.slice(0, 4);
  }

  get isMobileNavMoreActive(): boolean {
    const current = this.router.url.split('?')[0];
    return !this.mobileNavPaths.some(path => current === path || current.startsWith(path + '/'));
  }

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
    this.updatePageTitle(this.router.url);
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }

  private updatePageTitle(url: string): void {
    const path = url.split('?')[0];
    const key = this.routeTitleKeys[path];
    this.pageTitle.set(key ? this.i18n.translate(key) : 'App Taller Mecánico');
  }
}
