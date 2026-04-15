import { Injectable, effect, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.readPreference());

  constructor() {
    // Apply the theme synchronously in the constructor to prevent a Flash Of
    // Unstyled Content (FOUC). Angular's effect() runs after the first change
    // detection cycle — too late, as the browser would briefly render without
    // the 'dark' class. The direct DOM call here covers that initial render.
    document.documentElement.classList.toggle('dark', this.isDark());

    // effect() handles all subsequent changes: persists the preference and
    // keeps the class in sync whenever isDark() is updated via toggle().
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('dark', dark);
      try {
        localStorage.setItem(STORAGE_KEYS.theme, dark ? 'dark' : 'light');
      } catch { /* localStorage unavailable in private/incognito mode */ }
    });
  }

  toggle(): void {
    this.isDark.update(v => !v);
  }

  /**
   * Preference resolution priority:
   *   1. Stored user preference (explicit choice on a previous visit)
   *   2. OS/browser prefers-color-scheme media query (system default)
   *   3. Light mode (safe default when matchMedia is unavailable)
   */
  private readPreference(): boolean {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    if (stored !== null) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
