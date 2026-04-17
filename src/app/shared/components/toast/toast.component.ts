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
      class="fixed top-20 inset-x-0 flex flex-col items-center gap-2 z-50 pointer-events-none px-4"
      aria-live="polite"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="relative pointer-events-auto flex items-center gap-3 pl-3 pr-4 py-3
                 rounded-2xl shadow-lg text-sm font-medium overflow-hidden
                 w-full max-w-sm animate-slide-down
                 bg-white dark:bg-dark-card
                 border border-gray-100 dark:border-gray-700/60"
        >
          <!-- Colored icon bubble -->
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
            [class]="iconBubbleClass(toast.type)"
          >{{ toastIcon(toast.type) }}</span>

          <!-- Message -->
          <span class="flex-1 text-charcoal dark:text-white">
            {{ toast.message | translate }}
          </span>

          <!-- Colored left accent bar -->
          <span class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" [class]="accentClass(toast.type)"></span>

          <!-- Undo / action button -->
          @if (toast.action) {
            <button
              class="text-xs font-bold cursor-pointer active:opacity-70 transition-opacity flex-shrink-0
                     text-forest dark:text-sage underline underline-offset-2"
              (click)="runAction(toast)"
            >{{ toast.action.label | translate }}</button>
          }

          <!-- Dismiss -->
          <button
            class="w-6 h-6 flex items-center justify-center rounded-full cursor-pointer
                   text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                   hover:bg-gray-100 dark:hover:bg-gray-700
                   transition-all duration-150 flex-shrink-0"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  iconBubbleClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-forest/10 dark:bg-forest/30 text-forest dark:text-sage',
      error:   'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      info:    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    };
    return map[type];
  }

  accentClass(type: Toast['type']): string {
    const map: Record<Toast['type'], string> = {
      success: 'bg-forest',
      error:   'bg-red-500',
      info:    'bg-blue-500',
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

  runAction(toast: Toast): void {
    toast.action?.fn();
    this.toastService.dismiss(toast.id);
  }
}
