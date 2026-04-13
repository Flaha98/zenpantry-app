import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/pantry/pantry-page/pantry-page.component').then(
        m => m.PantryPageComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
