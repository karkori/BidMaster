import { Routes } from '@angular/router';

// Definimos las rutas base de la aplicación
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auctions',
    pathMatch: 'full'
  },
  {
    path: 'auctions',
    loadComponent: () => import('./app.component').then(m => m.AppComponent)
  }
];