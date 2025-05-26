import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterClientComponent } from './pages/auth/register-client/register-client.component';
import { RegisterCustomerComponent } from './pages/auth/register-customer/register-customer.component';
import { CarsComponent } from './pages/client/cars/cars.component';
import { PaymentsComponent } from './pages/client/payments/payments.component';
import { BrowseComponent } from './pages/customer/browse/browse.component';
import { HomeComponent } from './pages/main/home/home.component';
import { NotFoundComponent } from './pages/main/not-found/not-found.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './pages/client/client-dashboard/client-dashboard.component';
import { ClientRequestsComponent } from './pages/client/client-requests/client-requests.component';
import { CustomerRequestsComponent } from './pages/customer/customer-requests/customer-requests.component';
import { CustomerDashboardComponent } from './pages/customer/customer-dashboard/customer-dashboard.component';
import { AdminGuard } from './core/guards/admin.guard';
import { ClientGuard } from './core/guards/client.guard';
import { CustomerGuard } from './core/guards/customer.guard';
import { RegisterChoiceComponent } from './pages/auth/register-choice/register-choice.component';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { AdminClientsComponent } from './pages/admin/admin-clients/admin-clients.component';
import { AdminCarsModelsComponent } from './pages/admin/admin-cars-models/admin-cars-models.component';
import { AdminProfileComponent } from './pages/admin/admin-profile/admin-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  {
    path: 'register',
    component: RegisterChoiceComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: 'register-client',
    component: RegisterClientComponent,
    canActivate: [NoAuthGuard],
  },
  {
    path: 'register-customer',
    component: RegisterCustomerComponent,
    canActivate: [NoAuthGuard],
  },

  // Admin
  {
    path: 'admin',
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'clients', component: AdminClientsComponent },
      { path: 'car-models', component: AdminCarsModelsComponent },
      { path: 'profile', component: AdminProfileComponent },
    ],
  },

  // Client
  {
    path: 'client',
    canActivate: [ClientGuard],
    canActivateChild: [ClientGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'cars', component: CarsComponent },
      { path: 'requests', component: ClientRequestsComponent },
      { path: 'payments', component: PaymentsComponent },
    ],
  },

  // Customer
  {
    path: 'customer',
    canActivate: [CustomerGuard],
    canActivateChild: [CustomerGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'browse', component: BrowseComponent },
      { path: 'requests', component: CustomerRequestsComponent },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
  { path: 'not-found', component: NotFoundComponent },
];
