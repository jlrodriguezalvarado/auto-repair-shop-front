import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard, roleGuard, AuthService } from './core/services/auth.service';

const homePath = (): string => {
  const auth = inject(AuthService);
  if (!auth.user()) {
    return '/login';
  }
  if (auth.isReadOnlyCompanyView()) {
    return '/dashboard';
  }
  return auth.hasRole(['SUPER_ADMIN']) ? '/companies' : '/dashboard';
};

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./features/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
          const auth = inject(AuthService);
          if (auth.isReadOnlyCompanyView()) return 'dashboard';
          return auth.hasRole(['SUPER_ADMIN']) ? 'companies' : 'dashboard';
        }
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY', 'MECHANIC', 'CUSTOMER'])],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'companies',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () => import('./features/companies/companies.component').then(m => m.CompaniesComponent)
      },
      {
        path: 'company',
        canActivate: [roleGuard(['ADMIN', 'SECRETARY'])],
        loadComponent: () => import('./features/company/company.component').then(m => m.CompanyComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./features/vehicles/vehicles.component').then(m => m.VehiclesComponent)
      },
      {
        path: 'service-catalog',
        loadComponent: () => import('./features/service-catalog/service-catalog.component').then(m => m.ServiceCatalogComponent)
      },
      {
        path: 'work-orders',
        loadComponent: () => import('./features/work-orders/work-orders.component').then(m => m.WorkOrdersComponent)
      },
      {
        path: 'estimates',
        loadComponent: () => import('./features/estimates/estimates.component').then(m => m.EstimatesComponent)
      },
      {
        path: 'receipts',
        loadComponent: () => import('./features/receipts/receipts.component').then(m => m.ReceiptsComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard(['ADMIN'])],
        loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: () => homePath()
  }
];
