import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  {
    path: 'productos',
    title: 'Catálogo · Wishlist',
    loadComponent: () => import('./pages/productos').then((m) => m.ProductosPage),
  },
  {
    path: 'mi-lista',
    title: 'Mi lista · Wishlist',
    loadComponent: () => import('./pages/mi-lista').then((m) => m.MiListaPage),
  },
  {
    path: 'historial',
    title: 'Historial · Wishlist',
    loadComponent: () => import('./pages/historial').then((m) => m.HistorialPage),
  },
  {
    path: 'notificaciones',
    title: 'Notificaciones · Wishlist',
    loadComponent: () => import('./pages/notificaciones').then((m) => m.NotificacionesPage),
  },
  { path: '**', redirectTo: 'productos' },
];
