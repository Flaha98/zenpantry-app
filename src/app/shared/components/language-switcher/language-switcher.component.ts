import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

const STORAGE_KEY = 'zenpantry_lang';
const SUPPORTED_LANGS = ['en', 'pt-PT'] as const;

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700/60 rounded-lg p-0.5">
      @for (lang of langs; track lang) {
        <button
          class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 focus:outline-none"
          [class]="activeLang() === lang
            ? 'bg-white dark:bg-gray-600 shadow-sm text-forest dark:text-sage'
            : 'text-gray-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-gray-200'"
          (click)="use(lang)"
        >{{ lang === 'pt-PT' ? 'PT' : 'EN' }}</button>
      }
    </div>
  `,
})
export class LanguageSwitcherComponent {
  private readonly translate = inject(TranslateService);

  readonly langs = SUPPORTED_LANGS;

  // toSignal turns the onLangChange Observable into a Signal.
  // Any language change (from anywhere) keeps this in sync automatically,
  // and OnPush change detection reacts without needing markForCheck().
  readonly activeLang = toSignal(
    this.translate.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translate.currentLang ?? 'en' },
  );

  use(lang: string): void {
    this.translate.use(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* noop */ }
  }
}
