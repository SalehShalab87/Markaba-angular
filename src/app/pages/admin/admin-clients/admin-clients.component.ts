import { Component, inject } from '@angular/core';
import { TableColumn, DashboardTableComponent } from '../../../shared/components/dashboard-table/dashboard-table.component';
import { User } from '../../../models/user.model';
import { Subscription } from 'rxjs';
import { AdminService } from '../../../core/services/admin/admin.service';
import { NetworkStatusService } from '../../../core/services/network-status.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
  selector: 'app-admin-clients',
  imports: [DashboardTableComponent, LoaderComponent],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.scss',
})
export class AdminClientsComponent {
  clientColumns: TableColumn[] = [
    { field: 'name', header: 'name' },
    { field: 'email', header: 'email' },
    { field: 'address', header: 'Address' },
    { field: 'phone', header: 'phone' },
    { field: 'accountStatus', header: 'status' },
    { field: 'Client Actions', header: 'actions' },
  ];
  subscriptions: Subscription[] = [];
  clientsList: User[] = [];
  clientsStatusOptions: string[] = ['approved', 'rejected', 'pending'];
  isLoading: boolean = false;
  private adminService = inject(AdminService);
  private networkService = inject(NetworkStatusService);
  private toast = inject(ToastService);

  ngOnInit() {
    this.loadClients();
    this.handleNetworkStatus();
  }

  handleNetworkStatus(): void {
    this.subscriptions.push(
      this.networkService.onlineStatus$.subscribe({
        next: (isOnline: boolean) => {
          if (!isOnline) {
            this.isLoading = false;
            const errorTranslationKey = 'toast.error.network';
            this.toast.showError(errorTranslationKey);
          }
        },
      })
    );
  }
  loadClients() {
    this.isLoading = true;
    const sub = this.adminService.getAllClients().subscribe({
      next: (clients: User[]) => {
        this.clientsList = clients;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions.push(sub);
  }
  approveClient(client: any) {
    const sub = this.adminService.markClientAsApproved(client).subscribe(() => {
      this.loadClients();
    });
    this.subscriptions.push(sub);
  }

  rejectClient(client: any) {
    const sub = this.adminService.markClientAsRejected(client).subscribe(() => {
      this.loadClients();
    });
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
