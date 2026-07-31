import { Component, inject, signal, computed, ChangeDetectionStrategy, viewChild } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { NotificationsService } from '../../core/notifications/notifications.service';
import { NotificationPanelComponent } from '../../shared/components/notification-panel/notification-panel.component';
import { UserProfileMenuComponent } from '../../shared/components/user-profile-menu/user-profile-menu.component';
import { UserRole } from '../../core/api/models';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationPanelComponent,
    UserProfileMenuComponent,
  ],
  templateUrl: './shell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
  notifications = inject(NotificationsService);
  private router = inject(Router);
  pageTitle = signal('Dashboard');
  mobileNavOpen = signal(false);
  private panel = viewChild(NotificationPanelComponent);
  private readonly routeTitleKeys: Record<string, string> = {
    '/dashboard': 'nav.dashboard',
    '/companies': 'nav.companies',
    '/company': 'nav.company',
    '/customers': 'nav.customers',
    '/vehicles': 'nav.vehicles',
    '/service-catalog': 'nav.serviceCatalog',
    '/work-orders': 'nav.workOrders',
    '/estimates': 'nav.estimates',
    '/receipts': 'nav.receipts',
    '/users': 'nav.users',
    '/profile': 'nav.profile',
  };
  private readonly mobileNavPaths = ['/dashboard', '/vehicles', '/work-orders', '/receipts'];
  private readonly allNavItems: NavItem[] = [
    { path: '/companies', label: '', icon: 'domain', roles: ['SUPER_ADMIN'] },
    { path: '/dashboard', label: '', icon: 'dashboard', roles: ['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'] },
    { path: '/users', label: '', icon: 'group', roles: ['ADMIN'] },
    { path: '/company', label: '', icon: 'business', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/customers', label: '', icon: 'person', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/vehicles', label: '', icon: 'directions_car', roles: ['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'] },
    { path: '/service-catalog', label: '', icon: 'inventory_2', roles: ['ADMIN', 'SECRETARY'] },
    { path: '/work-orders', label: '', icon: 'build', roles: ['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'] },
    { path: '/estimates', label: '', icon: 'request_quote', roles: ['ADMIN', 'SECRETARY', 'CUSTOMER'] },
    { path: '/receipts', label: '', icon: 'receipt_long', roles: ['ADMIN', 'SECRETARY', 'CUSTOMER'] },
  ];
  readonly menuItems = computed(() => {
    const role = this.auth.user()?.role;
    const lang = this.i18n.language();
    void lang;
    const viewing = this.auth.isReadOnlyCompanyView();
    return this.allNavItems
      .filter((item) => {
        if (viewing) {
          return item.roles.includes('ADMIN') || item.path === '/companies';
        }
        return !!role && item.roles.includes(role);
      })
      .map((item) => ({
        ...item,
        label: this.i18n.translate(this.routeTitleKeys[item.path] || item.path),
      }));
  });
  readonly mobileNavItems = computed(() => {
    const items = this.menuItems().filter((item) => this.mobileNavPaths.includes(item.path));
    return items.length > 0 ? items : this.menuItems().slice(0, 4);
  });

  constructor() {
    this.updatePageTitle(this.router.url);
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.updatePageTitle((e as NavigationEnd).urlAfterRedirects);
      this.mobileNavOpen.set(false);
    });
    void this.notifications.refresh();
  }

  get isMobileNavMoreActive(): boolean {
    const current = this.router.url.split('?')[0];
    return !this.mobileNavPaths.some((path) => current === path || current.startsWith(path + '/'));
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.update((v) => !v);
  }

  toggleNotificationsPanel(): void {
    this.panel()?.toggle();
  }

  private updatePageTitle(url: string): void {
    const path = url.split('?')[0];
    const key = this.routeTitleKeys[path];
    this.pageTitle.set(key ? this.i18n.translate(key) : 'App Taller Mecánico');
  }
}
