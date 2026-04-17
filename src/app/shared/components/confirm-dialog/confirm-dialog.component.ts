import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop — z-50 is the highest valid Tailwind default -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center px-5
             bg-black/50 backdrop-blur-sm animate-fade-in"
      (click)="cancel.emit()"
      aria-hidden="true"
    >
      <!-- Panel -->
      <div
        role="alertdialog"
        aria-modal="true"
        class="w-full max-w-sm bg-white dark:bg-dark-card rounded-2xl
               shadow-2xl shadow-black/20 dark:shadow-black/50
               border border-gray-100/80 dark:border-gray-800/60
               animate-pop-in overflow-hidden"
        (click)="$event.stopPropagation()"
      >
        <!-- Icon + title -->
        <div class="flex flex-col items-center pt-7 pb-3 px-6 gap-3 text-center">
          <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30
                      flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 00-1 1v0m9-1a1 1 0 011 1v0M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-charcoal dark:text-white leading-snug">
              {{ titleKey() | translate }}
            </h3>
            @if (messageKey()) {
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {{ messageKey()! | translate: messageParams() }}
              </p>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 px-6 pt-2 pb-6">
          <button
            class="flex-1 py-2.5 rounded-xl
                   border border-gray-200 dark:border-gray-700
                   text-sm font-semibold text-gray-600 dark:text-gray-400
                   hover:bg-gray-50 dark:hover:bg-gray-800
                   active:scale-95 transition-all duration-150 cursor-pointer
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            (click)="cancel.emit()"
          >{{ cancelKey() | translate }}</button>

          <button
            class="flex-1 py-2.5 rounded-xl
                   text-sm font-semibold text-white
                   bg-red-500 hover:bg-red-600
                   shadow-md shadow-red-500/25
                   hover:shadow-lg hover:shadow-red-500/35
                   hover:scale-[1.03] active:scale-95
                   transition-all duration-150 cursor-pointer
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
            (click)="confirm.emit()"
          >{{ confirmKey() | translate }}</button>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly titleKey      = input.required<string>();
  readonly messageKey    = input<string | null>(null);
  readonly messageParams = input<Record<string, unknown>>({});
  readonly confirmKey    = input('confirm.delete');
  readonly cancelKey     = input('item.cancel');

  readonly confirm = output<void>();
  readonly cancel  = output<void>();

  constructor() {
    // Lock page scroll while the dialog is mounted so that mobile browser
    // overlay scrollbars (which composite above CSS z-index) disappear.
    const destroyRef = inject(DestroyRef);
    document.documentElement.classList.add('overflow-hidden');
    destroyRef.onDestroy(() => document.documentElement.classList.remove('overflow-hidden'));
  }
}
