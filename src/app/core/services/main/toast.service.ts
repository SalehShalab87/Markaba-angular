import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { I18nService } from '../i18n/i18n.service';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);
  private i18n = inject(I18nService);

  showSuccess(message: string): void {
    // Translate the message using the i18n service
    const translatedMessage = this.i18n.translate(message);
    const translatedSummary = this.i18n.translate('toast.success.title');
    this.messageService.add({
      severity: 'success',
      summary: translatedSummary,
      detail: translatedMessage,
      life: 3000,
    });
  }

  showError(message: string): void {
    // Translate the message using the i18n service
    const translatedMessage = this.i18n.translate(message);
    const translatedSummary = this.i18n.translate('toast.error.title');
    this.messageService.add({
      severity: 'error',
      summary: translatedSummary,
      detail: translatedMessage,
      life: 3000,
    });
  }

  showInfo(message: string): void {
    // Translate the message using the i18n service
    const translatedMessage = this.i18n.translate(message);
    const translatedSummary = this.i18n.translate('toast.info.title');
    this.messageService.add({
      severity: 'info',
      summary: translatedSummary,
      detail: translatedMessage,
      life: 3000,
    });
  }

  showWarn(message: string): void {
    // Translate the message using the i18n service
    const translatedMessage = this.i18n.translate(message);
    const translatedSummary = this.i18n.translate('toast.warn.title');
    this.messageService.add({
      severity: 'warn',
      summary: translatedSummary,
      detail: translatedMessage,
      life: 3000,
    });
  }

  clear(): void {
    // Clear all messages
    this.messageService.clear();
  }
}
