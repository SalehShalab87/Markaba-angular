import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  onlineStatus$ = this.onlineStatus.asObservable();

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  private updateOnlineStatus(isOnline: boolean) {
    this.onlineStatus.next(isOnline);
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}