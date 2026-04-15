import { Injectable, effect, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal<boolean>(this.readPreference());

  constructor() {
    // Apply synchronously to prevent FOUC — effect() runs after first CD cycle
    document.documentElement.classList.toggle('dark', this.isDark());

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
