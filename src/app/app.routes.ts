import { type Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';
import { Shell } from './core/layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then((module) => module.HomePage),
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page').then((module) => module.LoginPage),
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./features/auth/pages/register-page/register-page').then(
            (module) => module.RegisterPage,
          ),
      },
      {
        path: 'venues/:venueId',
        loadComponent: () =>
          import('./features/venues/pages/venue-detail-page/venue-detail-page').then(
            (module) => module.VenueDetailPage,
          ),
      },
      {
        path: 'sports-fields/:sportsFieldId',
        loadComponent: () =>
          import('./features/sports-fields/pages/sports-field-detail-page/sports-field-detail-page').then(
            (module) => module.SportsFieldDetailPage,
          ),
      },
      {
        path: 'reservations',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reservations/pages/reservation-list-page/reservation-list-page').then(
            (module) => module.ReservationListPage,
          ),
      },
      {
        path: 'reservations/new',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reservations/pages/reservation-create-page/reservation-create-page').then(
            (module) => module.ReservationCreatePage,
          ),
      },
      {
        path: 'reservations/:reservationId',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/reservations/pages/reservation-detail-page/reservation-detail-page').then(
            (module) => module.ReservationDetailPage,
          ),
      },
      {
        path: 'maintenance',
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['staff', 'admin'],
        },
        loadComponent: () =>
          import('./features/maintenance/pages/maintenance-block-page/maintenance-block-page').then(
            (module) => module.MaintenanceBlockPage,
          ),
      },
      {
        path: 'admin/venues',
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['admin'],
        },
        loadComponent: () =>
          import('./features/admin/pages/venue-management-page/venue-management-page').then(
            (module) => module.VenueManagementPage,
          ),
      },
      {
        path: 'admin/sports-fields',
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['admin'],
        },
        loadComponent: () =>
          import('./features/admin/pages/sports-field-management-page/sports-field-management-page').then(
            (module) => module.SportsFieldManagementPage,
          ),
      },
      {
        path: 'admin/users',
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['admin'],
        },
        loadComponent: () =>
          import('./features/admin/pages/user-management-page/user-management-page').then(
            (module) => module.UserManagementPage,
          ),
      },
      {
        path: 'admin/staff-assignments',
        canActivate: [authGuard, roleGuard],
        data: {
          roles: ['admin'],
        },
        loadComponent: () =>
          import('./features/admin/pages/staff-assignment-page/staff-assignment-page').then(
            (module) => module.StaffAssignmentPage,
          ),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
