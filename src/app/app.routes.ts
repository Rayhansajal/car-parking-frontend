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
        loadComponent: () => import('./features/parking-lots/parking-lots.component')
                             .then(m => m.ParkingLotsComponent)
      },
{
    path: 'parking-lots/create',
    loadComponent: () => import('./features/dashboard/parking-lot-form/parking-lot-form')
                        .then(m => m.ParkingLotFormComponent)
},
{
    path: 'parking-lots/:id/edit',
    loadComponent: () => import('./features/dashboard/parking-lot-form/parking-lot-form')
                        .then(m => m.ParkingLotFormComponent)
},

      // // ==================== PARKING SLOTS ====================
      // {
      //   path: 'parking-slots',
      //   loadComponent: () => import('./features/parking-slots/parking-slot-list/parking-slot-list.component')
      //                        .then(m => m.ParkingSlotListComponent)
      // },
      // {
      //   path: 'parking-slots/create',
      //   loadComponent: () => import('./features/parking-slots/parking-slot-form/parking-slot-form.component')
      //                        .then(m => m.ParkingSlotFormComponent)
      // },

      // // ==================== BOOKINGS ====================
      // {
      //   path: 'bookings',
      //   loadComponent: () => import('./features/bookings/booking-list/booking-list.component')
      //                        .then(m => m.BookingListComponent)
      // },
      // {
      //   path: 'my-bookings',
      //   loadComponent: () => import('./features/bookings/my-bookings/my-bookings.component')
      //                        .then(m => m.MyBookingsComponent)
      // },

      // Future routes can be added here
    ]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
