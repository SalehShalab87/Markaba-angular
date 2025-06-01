import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterClientComponent } from './pages/auth/register-client/register-client.component';
import { RegisterCustomerComponent } from './pages/auth/register-customer/register-customer.component';
import { HomeComponent } from './pages/main/home/home.component';
import { NotFoundComponent } from './pages/main/not-found/not-found.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './pages/client/client-dashboard/client-dashboard.component';
import { CustomerRequestsComponent } from './pages/customer/customer-requests/customer-requests.component';
import { AdminGuard } from './core/guards/admin.guard';
import { ClientGuard } from './core/guards/client.guard';
import { CustomerGuard } from './core/guards/customer.guard';
import { RegisterChoiceComponent } from './pages/auth/register-choice/register-choice.component';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { AdminClientsComponent } from './pages/admin/admin-clients/admin-clients.component';
import { AdminCarsModelsComponent } from './pages/admin/admin-cars-models/admin-cars-models.component';
import { AdminProfileComponent } from './pages/admin/admin-profile/admin-profile.component';
import { CarsListingComponent } from './pages/main/cars-listing/cars-listing.component';
import { ContactUsComponent } from './pages/main/contact-us/contact-us.component';
import { AboutUsComponent } from './pages/main/about-us/about-us.component';
import { CarDetailsComponent } from './pages/main/car-details/car-details.component';
import { AddCarsComponent } from './pages/client/add-car/add-cars.component';
import { MyCarsComponent } from './pages/client/my-cars/my-cars.component';
import { ClientProfileComponent } from './pages/client/client-profile/client-profile.component';
import { CustomerProfileComponent } from './pages/customer/customer-profile/customer-profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public
  { path: 'home', component: HomeComponent, canActivate: [NoAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [NoAuthGuard] },
  { path: 'car-listings', component: CarsListingComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'car-details/:id', component: CarDetailsComponent },
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
      { path: 'edit-car/:id', component: AddCarsComponent },
      { path: 'profile', component: AdminProfileComponent },
      { path: 'edit-profile/:id', component: AdminProfileComponent},
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
      { path: 'add-cars', component: AddCarsComponent },
      { path: 'my-cars', component: MyCarsComponent },
      { path: 'edit-car/:id', component: AddCarsComponent },
      { path: 'profile', component: ClientProfileComponent },
    ],
  },

  // Customer
  {
    path: 'customer',
    canActivate: [CustomerGuard],
    canActivateChild: [CustomerGuard],
    children: [
      { path: '', redirectTo: 'car-listings', pathMatch: 'full' },
      { path: 'car-listings', component: CarsListingComponent },
      { path: 'requests', component: CustomerRequestsComponent },
      { path: 'profile', component: CustomerProfileComponent },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'not-found', pathMatch: 'full' },
  { path: 'not-found', component: NotFoundComponent },
];
