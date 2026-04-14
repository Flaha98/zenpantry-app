import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * ToastService manages ephemeral notifications using a Signal-backed queue.
 * Each toast auto-dismisses after 3 seconds.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'success'): void {
    const toast: Toast = { id: crypto.randomUUID(), message, type };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: string): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
