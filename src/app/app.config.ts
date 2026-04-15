import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { STORAGE_KEYS } from './core/constants/storage-keys';

/**
 * APP_INITIALIZER factory that loads the user's preferred locale before the
 * app renders. Registering it as APP_INITIALIZER blocks Angular's bootstrap
 * sequence until the returned Promise resolves, guaranteeing that translations
 * are in memory before any component template is evaluated — preventing a flash
 * of untranslated content (FOTC) on startup.
 */
function initTranslations(translate: TranslateService): () => Promise<void> {
  return () => {
    const lang = localStorage.getItem(STORAGE_KEYS.lang) ?? 'en';

    // Sync the <html lang=""> attribute for screen readers and SEO.
    // ngx-translate uses the full BCP 47 tag ('pt-PT') internally, but the
    // HTML spec expects the primary language subtag for the lang attribute.
    document.documentElement.lang = lang === 'pt-PT' ? 'pt' : lang;

    // firstValueFrom converts the Observable to a Promise (APP_INITIALIZER
    // requires a factory that returns () => Promise<void> | void).
    // catchError ensures we always resolve — a missing or malformed locale file
    // must never crash the entire app; English is the safe fallback.
    return firstValueFrom(
      translate.use(lang).pipe(catchError(() => translate.use('en')))
    ).then(() => undefined); // cast Promise<void | undefined> → Promise<void>
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(), // Required by TranslateHttpLoader to fetch /assets/i18n/*.json
    provideTranslateService({ fallbackLang: 'en' }),
    ...provideTranslateHttpLoader(), // Configures HttpLoader with default path assets/i18n/
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true, // multi:true allows coexistence with other APP_INITIALIZER tokens
    },
  ],
};
