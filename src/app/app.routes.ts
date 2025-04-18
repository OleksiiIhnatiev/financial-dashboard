import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./components/credits-table/credits-table.component').then(
        (m) => m.CreditsTableComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./components/short-information/short-information.component').then(
        (m) => m.ShortInformationComponent
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
