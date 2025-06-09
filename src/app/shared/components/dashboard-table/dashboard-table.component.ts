import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { Car } from '../../../models/car.model';
import { User } from '../../../models/user.model';
import { Request } from '../../../models/car-request.model';
import { CarModel } from '../../../models/car-model.model';

export interface TableColumn {
  field: string;
  header: string;
}

@Component({
  selector: 'app-dashboard-table',
  templateUrl: './dashboard-table.component.html',
  styleUrls: ['./dashboard-table.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
})
export class DashboardTableComponent implements OnInit, OnChanges {
  @Input() data: Car[] | Request[] | User[] | CarModel[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() rowsPerPage = 10;
  @Input() title = 'Table';
  @Input() statusOptions: string[] = [];
  @Input() statusFields: string[] = [];

  @Input() userType: 'admin' | 'client' = 'admin';
  @Output() accept = new EventEmitter<Request | User>();
  @Output() reject = new EventEmitter<Request | User>();

  @Output() delete = new EventEmitter<User | Car | Request | CarModel>();
  @Output() edit = new EventEmitter<User | Car | Request | CarModel>();
  @Output() cancelRequest = new EventEmitter<Request>();

  searchKeyword = '';
  filteredData!: (Car | Request | User | CarModel)[];
  pagedData!: (Car | Request | User | CarModel)[];
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;
  totalPages = 1;
  statusFilter = '';
  notCarModelsTable = true;

  ngOnInit() {
    this.filteredData = [...this.data];
    this.title === 'dashboard.carModels'
      ? (this.notCarModelsTable = false)
      : (this.notCarModelsTable = true);
    this.updateTable();
  }

  ngOnChanges() {
    this.filteredData = [...this.data];
    this.title === 'dashboard.carModels'
      ? (this.notCarModelsTable = false)
      : (this.notCarModelsTable = true);
    this.updateTable();
  }

  filterTable() {
    const keyword = this.searchKeyword.toLowerCase();
    this.filteredData = this.data.filter(
      (row) =>
        this.columns.some((col) =>
          String(this.getCellValue(row, col.field))
            .toLowerCase()
            .includes(keyword)
        ) &&
        (this.statusFilter && this.statusFields.length
          ? this.statusFields.some((field) => {
              const fieldValue = String(
                this.getCellValue(row, field)
              ).toLowerCase();
              const filterValue = this.statusFilter.toLowerCase();
              return fieldValue === filterValue;
            })
          : true)
    );
    this.currentPage = 1;
    this.updateTable();
  }

  sortTable(field: string) {
    if (this.sortColumn === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = field;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      const valA = this.getCellValue(a, field);
      const valB = this.getCellValue(b, field);

      const numericFields = ['price', 'pricePerDay', 'paymentAmount'];
      const isNumericField = numericFields.includes(field);

      if (isNumericField) {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return this.sortDirection === 'asc' ? numA - numB : numB - numA;
      } else {
        const strA = (valA ?? '').toString().toLowerCase();
        const strB = (valB ?? '').toString().toLowerCase();

        if (strA < strB) return this.sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });

    this.updateTable();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateTable();
  }

  updateTable() {
    this.totalPages =
      Math.ceil(this.filteredData.length / this.rowsPerPage) || 1;
    const start = (this.currentPage - 1) * this.rowsPerPage;
    this.pagedData = this.filteredData.slice(start, start + this.rowsPerPage);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCellValue(row: any, field: string): string {
    const value = field.split('.').reduce((acc, part) => acc && acc[part], row);
    return value !== undefined && value !== null && value !== '' ? value : '—';
  }

  getStatusClass(status: string | boolean | null | undefined): string {
    const value =
      status === true
        ? 'available'
        : status === false
        ? 'unavailable'
        : (status ?? '').toString().toLowerCase();

    if (!value) return 'badge bg-secondary';
    if (
      [
        'approved',
        'success',
        'paid',
        'active',
        'accepted',
        'available',
        'completed',
      ].includes(value)
    )
      return 'badge bg-success';
    if (['pending', 'info'].includes(value)) return 'badge bg-warning';
    if (
      [
        'rejected',
        'declined',
        'unqualified',
        'failed',
        'unavailable',
        'cancelled',
      ].includes(value)
    )
      return 'badge bg-danger';
    if (['warning', 'negotiation'].includes(value))
      return 'badge bg-warning text-dark';
    return '';
  }

  isStatusColumn(col: TableColumn): boolean {
    const statusFields = [
      'accountStatus',
      'requestStatus',
      'paymentStatus',
      'isAvailable',
    ];
    return statusFields.includes(col.field);
  }

  totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, acc) => acc + 1);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAccept(row: any) {
    this.accept.emit(row);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReject(row: any) {
    this.reject.emit(row);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit(row: any) {
    this.edit.emit(row);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete(row: any) {
    this.delete.emit(row);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCancelRequest(row: any) {
    this.cancelRequest.emit(row);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canCancelRequest(row: any): boolean {
    return row.requestStatus === 'pending';
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canAcceptReject(row: any): boolean {
    return this.userType === 'client' && row.requestStatus === 'pending';
  }
}
