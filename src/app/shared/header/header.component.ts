import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 inset-x-0 z-40 h-16 flex items-center px-4 gap-3
                   bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div class="w-8 h-8 rounded-xl bg-forest flex items-center justify-center flex-shrink-0">
          <span class="text-base leading-none">🌿</span>
        </div>
        <span class="font-bold text-lg text-gray-900 dark:text-white tracking-tight truncate">
          {{ 'app.title' | translate }}
        </span>
      </div>

      <button
        class="w-9 h-9 flex items-center justify-center rounded-xl
               bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300
               hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-90 transition-all duration-200"
        (click)="theme.toggle()"
        [attr.aria-label]="theme.isDark() ? ('header.theme.light' | translate) : ('header.theme.dark' | translate)"
      >
        @if (theme.isDark()) {
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        } @else {
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z" />
          </svg>
        }
      </button>
    </header>
  `,
})
export class HeaderComponent {
  readonly theme = inject(ThemeService);
}
