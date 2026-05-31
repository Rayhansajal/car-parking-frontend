import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
{
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component')
                         .then(m => m.AuthComponent)
  },
  
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./features/dashboard/dashboard.component')
                             .then(m => m.DashboardComponent) 
      },
// ==================== PARKING LOTS ====================
      {
        path: 'parking-lots',
        children: [
          { 
            path: '', 
            loadComponent: () => import('./features/parking-lots/parking-lots.component')
                                 .then(m => m.ParkingLotsComponent) 
          },
          { 
            path: 'new', 
            loadComponent: () => import('./features/dashboard/parking-lot-form/parking-lot-form')
                                 .then(m => m.ParkingLotFormComponent) 
          },
          { 
            path: ':id/edit', 
            loadComponent: () => import('./features/dashboard/parking-lot-form/parking-lot-form')
                                 .then(m => m.ParkingLotFormComponent) 
          }
        ]
      },

      // ==================== PARKING SLOTS ====================
      {
        path: 'slots',
        loadComponent: () => import('./features/parking-slots/parking-slots.component')
                             .then(m => m.ParkingSlotsComponent)
      },

      {
        path: 'bookings',
        loadComponent: () => import('./features/bookings/bookings.component')
                             .then(m => m.BookingsComponent)
      },
      {
        path: 'bookings/my',
        loadComponent: () => import('./features/bookings/bookings.component')
                             .then(m => m.BookingsComponent)
      },

      // Future routes can be added here
    ]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
