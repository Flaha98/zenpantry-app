import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { STORAGE_KEYS } from '../../../core/constants/storage-keys';

const SUPPORTED_LANGS = ['en', 'pt-PT'] as const;

const LANG_META: Record<string, { label: string; flag: string }> = {
  'en':    { label: 'EN', flag: '🇬🇧' },
  'pt-PT': { label: 'PT', flag: '🇵🇹' },
};

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Segmented control with sliding indicator -->
    <div class="relative flex items-center bg-gray-100 dark:bg-gray-700/60 rounded-xl p-0.5 h-8">

      <!-- Sliding background indicator -->
      <span
        class="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-[9px]
               bg-white dark:bg-gray-600 shadow-sm
               transition-transform duration-200 ease-in-out"
        [class]="activeLang() === 'en' ? 'translate-x-0 left-0.5' : 'translate-x-full left-0.5'"
        aria-hidden="true">
      </span>

      <!-- Language buttons -->
      @for (lang of langs; track lang) {
        <button
          class="relative z-10 flex items-center justify-center gap-1
                 w-11 h-7 rounded-[9px] text-xs font-semibold
                 transition-colors duration-200 focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-forest/40"
          [class]="activeLang() === lang
            ? 'text-forest dark:text-sage'
            : 'text-gray-500 dark:text-gray-400 hover:text-charcoal dark:hover:text-gray-200'"
          (click)="use(lang)"
          [attr.aria-pressed]="activeLang() === lang"
          [attr.aria-label]="meta(lang).label"
        >
          <span class="text-sm leading-none">{{ meta(lang).flag }}</span>
          <span>{{ meta(lang).label }}</span>
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcherComponent {
  private readonly translate = inject(TranslateService);

  readonly langs = SUPPORTED_LANGS;

  // toSignal converts onLangChange (Observable) into a Signal, making it
  // compatible with OnPush change detection without calling markForCheck().
  // initialValue seeds the signal synchronously so the active language is
  // known before the first emission, preventing an undefined/flash on load.
  readonly activeLang = toSignal(
    this.translate.onLangChange.pipe(map(e => e.lang)),
    { initialValue: this.translate.currentLang ?? 'en' },
  );

  meta(lang: string): { label: string; flag: string } {
    return LANG_META[lang] ?? { label: lang.toUpperCase(), flag: '' };
  }

  use(lang: string): void {
    // Guard prevents redundant translations and change-detection cycles when
    // the user taps the already-active language button.
    if (this.activeLang() === lang) return;
    this.translate.use(lang);
    try { localStorage.setItem(STORAGE_KEYS.lang, lang); } catch { /* noop */ }
  }
}
