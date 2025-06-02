// app.routes.ts
import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { ClientGuard } from './core/guards/client.guard';
import { CustomerGuard } from './core/guards/customer.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public Routes - Lazy Loaded
  { 
    path: 'home', 
    loadComponent: () => import('./pages/main/home/home.component').then(m => m.HomeComponent),
    canActivate: [NoAuthGuard] 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [NoAuthGuard] 
  },
  { 
    path: 'car-listings', 
    loadComponent: () => import('./pages/main/cars-listing/cars-listing.component').then(m => m.CarsListingComponent)
  },
  { 
    path: 'contact-us', 
    loadComponent: () => import('./pages/main/contact-us/contact-us.component').then(m => m.ContactUsComponent)
  },
  { 
    path: 'about-us', 
    loadComponent: () => import('./pages/main/about-us/about-us.component').then(m => m.AboutUsComponent)
  },
  { 
    path: 'car-details/:id', 
    loadComponent: () => import('./pages/main/car-details/car-details.component').then(m => m.CarDetailsComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register-choice/register-choice.component').then(m => m.RegisterChoiceComponent),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'register-client',
    loadComponent: () => import('./pages/auth/register-client/register-client.component').then(m => m.RegisterClientComponent),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'register-customer',
    loadComponent: () => import('./pages/auth/register-customer/register-customer.component').then(m => m.RegisterCustomerComponent),
    canActivate: [NoAuthGuard],
  },

  // Admin Routes - Lazy Loaded
  {
    path: 'admin',
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      { 
        path: 'clients', 
        loadComponent: () => import('./pages/admin/admin-clients/admin-clients.component').then(m => m.AdminClientsComponent)
      },
      { 
        path: 'car-models', 
        loadComponent: () => import('./pages/admin/admin-cars-models/admin-cars-models.component').then(m => m.AdminCarsModelsComponent)
      },
      { 
        path: 'edit-car/:id', 
        loadComponent: () => import('./pages/client/add-car/add-cars.component').then(m => m.AddCarsComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/admin/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
      },
      { 
        path: 'edit-profile/:id', 
        loadComponent: () => import('./pages/admin/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
      },
    ],
  },

  // Client Routes - Lazy Loaded
  {
    path: 'client',
    canActivate: [ClientGuard],
    canActivateChild: [ClientGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/client/client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
      },
      { 
        path: 'add-cars', 
        loadComponent: () => import('./pages/client/add-car/add-cars.component').then(m => m.AddCarsComponent)
      },
      { 
        path: 'my-cars', 
        loadComponent: () => import('./pages/client/my-cars/my-cars.component').then(m => m.MyCarsComponent)
      },
      { 
        path: 'edit-car/:id', 
        loadComponent: () => import('./pages/client/add-car/add-cars.component').then(m => m.AddCarsComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/client/client-profile/client-profile.component').then(m => m.ClientProfileComponent)
      },
    ],
  },

  // Customer Routes - Lazy Loaded
  {
    path: 'customer',
    canActivate: [CustomerGuard],
    canActivateChild: [CustomerGuard],
    children: [
      { path: '', redirectTo: 'car-listings', pathMatch: 'full' },
      { 
        path: 'car-listings', 
        loadComponent: () => import('./pages/main/cars-listing/cars-listing.component').then(m => m.CarsListingComponent)
      },
      { 
        path: 'requests', 
        loadComponent: () => import('./pages/customer/customer-requests/customer-requests.component').then(m => m.CustomerRequestsComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/customer/customer-profile/customer-profile.component').then(m => m.CustomerProfileComponent)
      },
    ],
  },

  // Fallback
  { 
    path: 'not-found', 
    loadComponent: () => import('./pages/main/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
];
