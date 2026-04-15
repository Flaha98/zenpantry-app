import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { STORAGE_KEYS } from './core/constants/storage-keys';

/**
 * Loads the saved (or default) language before the app renders.
 * APP_INITIALIZER blocks rendering until the returned promise resolves,
 * so the user never sees raw i18n keys flash on screen.
 */
function initTranslations(translate: TranslateService): () => Promise<void> {
  return () => {
    const lang = localStorage.getItem(STORAGE_KEYS.lang) ?? 'en';
    return firstValueFrom(translate.use(lang)).then(() => undefined);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    // ORDER MATTERS — Angular uses "last provider wins" for the same token.
    // provideTranslateService() internally registers TranslateNoOpLoader as default.
    // provideTranslateHttpLoader() must come AFTER to override it with the real loader.
    provideTranslateService({ fallbackLang: 'en' }),
    ...provideTranslateHttpLoader(),   // default: prefix=/assets/i18n/ suffix=.json

    // Block first render until translations are fully loaded
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true,
    },
  ],
};
