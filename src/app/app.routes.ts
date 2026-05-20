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
      // Future routes will go here
    ]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
