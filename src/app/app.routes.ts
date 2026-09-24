import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard, AuthService } from './core/services/auth.service';

const homePath = (): string => {
  const auth = inject(AuthService);
  return auth.homePath();
};

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./features/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
          const auth = inject(AuthService);
          if (auth.isReadOnlyCompanyView()) return 'dashboard';
          return auth.hasRole(['SUPER_ADMIN']) ? 'companies' : 'dashboard';
        },
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'])],
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'companies',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () => import('./features/companies/companies.component').then((m) => m.CompaniesComponent),
      },
      {
        path: 'company',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY'])],
        loadComponent: () => import('./features/company/company.component').then((m) => m.CompanyComponent),
      },
      {
        path: 'customers',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY'])],
        loadComponent: () => import('./features/customers/customers.component').then((m) => m.CustomersComponent),
      },
      {
        path: 'vehicles',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'])],
        loadComponent: () => import('./features/vehicles/vehicles.component').then((m) => m.VehiclesComponent),
      },
      {
        path: 'service-catalog',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY'])],
        loadComponent: () =>
          import('./features/service-catalog/service-catalog.component').then((m) => m.ServiceCatalogComponent),
      },
      {
        path: 'work-orders',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'])],
        loadComponent: () => import('./features/work-orders/work-orders.component').then((m) => m.WorkOrdersComponent),
      },
      {
        path: 'estimates',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY', 'CUSTOMER'])],
        loadComponent: () => import('./features/estimates/estimates.component').then((m) => m.EstimatesComponent),
      },
      {
        path: 'receipts',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY', 'CUSTOMER'])],
        loadComponent: () => import('./features/receipts/receipts.component').then((m) => m.ReceiptsComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/users.component').then((m) => m.UsersComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: () => homePath(),
  },
];
