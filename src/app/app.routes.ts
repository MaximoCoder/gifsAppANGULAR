import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./gifs/pages/dashboard-page/dashboard-page'), // lazy load para el component
    // si ponemos export default en el component nos evitamos el .then(m => m.NombreComponente)

    children: [
      {
        path: 'trending',
        loadComponent: () => import('./gifs/pages/trending-page/trending-page'),
      },
      {
        path: 'search',
        loadComponent: () => import('./gifs/pages/search-page/search-page'),
      },
      {
        path: 'history/:query',
        loadComponent: () => import('./gifs/pages/gif-history/gif-history'),
      },
      {
        path: '**',
        redirectTo: 'trending',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
