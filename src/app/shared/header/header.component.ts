import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageSwitcherComponent } from '../components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslatePipe, LanguageSwitcherComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed top-0 inset-x-0 z-40 h-16 flex items-center px-4 gap-3
                   bg-cream/90 dark:bg-dark-bg/90 backdrop-blur-md
                   border-b border-gray-100 dark:border-gray-800/60">

      <!-- ── Logo ────────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2.5 flex-1 min-w-0">
        <div class="w-9 h-9 rounded-xl bg-forest flex items-center justify-center
                    flex-shrink-0 shadow-sm shadow-forest/30">
          <!-- Sprout icon — consistent across all platforms (no emoji rendering issues) -->
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
               aria-hidden="true">
            <!-- Stem -->
            <line x1="12" y1="21" x2="12" y2="10" stroke="white" stroke-width="2"
                  stroke-linecap="round"/>
            <!-- Left leaf -->
            <path d="M12 17 Q5 15 5 8 Q12 8 12 17 Z" fill="rgba(255,255,255,0.85)"/>
            <!-- Right leaf -->
            <path d="M12 13 Q19 11 19 4 Q12 4 12 13 Z" fill="white"/>
          </svg>
        </div>
        <span class="font-bold text-lg text-charcoal dark:text-white tracking-tight truncate">
          {{ 'app.title' | translate }}
        </span>
      </div>

      <!-- ── Controls ─────────────────────────────────────────────────── -->
      <div class="flex items-center gap-2.5 flex-shrink-0">
        <app-language-switcher />

        <!-- Theme toggle — sliding pill -->
        <button
          class="relative w-14 h-7 rounded-full p-0.5 flex-shrink-0
                 bg-gray-200 dark:bg-forest
                 transition-colors duration-300 ease-in-out
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40
                 active:scale-95"
          (click)="theme.toggle()"
          role="switch"
          [attr.aria-checked]="theme.isDark()"
          [attr.aria-label]="theme.isDark()
            ? ('header.theme.light' | translate)
            : ('header.theme.dark' | translate)"
        >
          <!-- Sliding indicator -->
          <span
            class="flex items-center justify-center
                   w-6 h-6 rounded-full bg-white shadow-sm
                   transition-transform duration-300 ease-in-out
                   translate-x-0 dark:translate-x-7"
          >
            <!-- Sun: shown in light mode -->
            @if (!theme.isDark()) {
              <svg class="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
              </svg>
            }
            <!-- Moon: shown in dark mode -->
            @if (theme.isDark()) {
              <svg class="w-3.5 h-3.5 text-forest" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z"/>
              </svg>
            }
          </span>
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly theme = inject(ThemeService);
}
