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
  templateUrl: './language-switcher.component.html',
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
