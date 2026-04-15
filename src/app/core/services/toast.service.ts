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

  // Tracks the auto-dismiss timer for each toast by id.
  // Storing timers separately (rather than on the Toast object) keeps the
  // domain model clean and avoids serialisation issues.
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  show(message: string, type: ToastType = 'success'): void {
    const toast: Toast = { id: crypto.randomUUID(), message, type };
    this.toasts.update(list => [...list, toast]);

    // Schedule auto-dismiss; the timer reference is stored so it can be
    // cancelled if the user manually dismisses before the 3 s window elapses.
    const timer = setTimeout(() => this.dismiss(toast.id), 3000);
    this.timers.set(toast.id, timer);
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      // Cancel the scheduled auto-dismiss to prevent a double-removal attempt
      // when the user closes the toast before the 3 s timeout fires.
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
