import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

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
export class DashboardTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() rowsPerPage: number = 10;
  @Input() title: string = 'Table';
  @Input() statusOptions: string[] = [];
  @Input() statusFields: string[] = [];

  @Output() accept = new EventEmitter<any>();
  @Output() reject = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  searchKeyword: string = '';
  filteredData: any[] = [];
  pagedData: any[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  totalPages: number = 1;
  statusFilter: string = '';

  ngOnInit() {
    this.filteredData = [...this.data];
    this.updateTable();
  }

  ngOnChanges() {
    this.filteredData = [...this.data];
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
          ? this.statusFields.some(
              (field) =>
                String(this.getCellValue(row, field)).toLowerCase() ===
                this.statusFilter.toLowerCase()
            )
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
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
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

  getCellValue(row: any, field: string): any {
    const value = field.split('.').reduce((acc, part) => acc && acc[part], row);
    return value !== undefined && value !== null && value !== ''? value : '—';
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

  // Add a helper to check if a column is a status-like field
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

  onAccept(row: any) {
    this.accept.emit(row);
  }

  onReject(row: any) {
    this.reject.emit(row);
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }
}
