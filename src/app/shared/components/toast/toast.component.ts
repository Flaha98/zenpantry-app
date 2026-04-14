import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed bottom-24 inset-x-0 flex flex-col items-center gap-2 z-50 pointer-events-none px-4"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium w-full max-w-sm animate-pop-in"
          [class]="toastClass(toast.type)"
        >
          <span class="text-lg leading-none">{{ toastIcon(toast.type) }}</span>
          <span class="flex-1">{{ toast.message | translate }}</span>
          <button
            class="opacity-70 hover:opacity-100 transition-opacity ml-1 leading-none"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss"
          >✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  toastClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-forest text-white',
      error:   'bg-red-600 text-white',
      info:    'bg-blue-600 text-white',
    };
    return map[type];
  }

  toastIcon(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: '✓',
      error:   '✕',
      info:    'ℹ',
    };
    return map[type];
  }
}
