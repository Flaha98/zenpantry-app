import { Injectable, effect, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';

/**
 * ThemeService controls dark/light mode via Tailwind's `dark` class on <html>.
 *
 * Angular's effect() is used to keep the DOM and localStorage in sync whenever
 * the isDark signal changes — no subscriptions or manual cleanup required.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Initialised from localStorage, falls back to the OS preference
  readonly isDark = signal<boolean>(this.readPreference());

  constructor() {
    // Runs immediately and re-runs on every isDark change
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      try {
        localStorage.setItem(STORAGE_KEYS.theme, dark ? 'dark' : 'light');
      } catch { /* private mode */ }
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  private readPreference(): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
