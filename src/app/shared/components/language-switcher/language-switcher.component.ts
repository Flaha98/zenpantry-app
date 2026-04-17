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
    <button
      class="w-9 h-9 rounded-2xl flex items-center justify-center gap-0.5
             bg-white dark:bg-dark-card shadow-sm cursor-pointer
             hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md hover:scale-105
             active:scale-90 transition-all duration-200
             focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
      (click)="toggle()"
      [attr.aria-label]="meta(nextLang()).label"
    >
      <span class="text-sm leading-none">{{ meta(activeLang()).flag }}</span>
      <span class="text-[10px] font-bold text-charcoal dark:text-white leading-none">{{ meta(activeLang()).label }}</span>
    </button>
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

  nextLang(): string {
    return this.langs.find(l => l !== this.activeLang()) ?? this.langs[0];
  }

  toggle(): void {
    const next = this.nextLang();
    this.translate.use(next);
    try { localStorage.setItem(STORAGE_KEYS.lang, next); } catch { /* noop */ }
  }
}
