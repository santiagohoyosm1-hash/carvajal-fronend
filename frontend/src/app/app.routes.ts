import { Routes } from '@angular/router';
import { authGuard, sinSesionGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  {
    path: 'login',
    title: 'Iniciar sesión · Wishlist',
    canActivate: [sinSesionGuard],
    loadComponent: () => import('./pages/login').then((m) => m.LoginPage),
  },
  {
    path: 'productos',
    title: 'Catálogo · Wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/productos').then((m) => m.ProductosPage),
  },
  {
    path: 'mi-lista',
    title: 'Mi lista · Wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mi-lista').then((m) => m.MiListaPage),
  },
  {
    path: 'historial',
    title: 'Historial · Wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/historial').then((m) => m.HistorialPage),
  },
  {
    path: 'notificaciones',
    title: 'Notificaciones · Wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notificaciones').then((m) => m.NotificacionesPage),
  },
  { path: '**', redirectTo: 'productos' },
];
