import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { STORAGE_KEYS } from './core/constants/storage-keys';

function initTranslations(translate: TranslateService): () => Promise<void> {
  return () => {
    const lang = localStorage.getItem(STORAGE_KEYS.lang) ?? 'en';
    document.documentElement.lang = lang === 'pt-PT' ? 'pt' : lang;
    return firstValueFrom(
      translate.use(lang).pipe(catchError(() => translate.use('en')))
    ).then(() => undefined);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({ fallbackLang: 'en' }),
    ...provideTranslateHttpLoader(),
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true,
    },
  ],
};
