import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: ToastType = 'success'): void {
    const toast: Toast = { id: crypto.randomUUID(), message, type };
    this.toasts.update(list => [...list, toast]);
    const timer = setTimeout(() => this.dismiss(toast.id), 3000);
    this.timers.set(toast.id, timer);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
