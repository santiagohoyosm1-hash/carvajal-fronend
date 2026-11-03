import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Deseo, Movimiento, Notificacion, Producto } from './models';

/** Todas las rutas pasan por el gateway (/api → http://localhost:8080 con proxy.conf.json). */
@Injectable({ providedIn:'root' })
export class Api {
  private readonly http = inject(HttpClient);

  productos() {
    return this.http.get<Producto[]>('/api/productos');
  }
  crearProducto(p: Producto) {
    return this.http.post<Producto>('/api/productos', p);
  }
  actualizarProducto(id: number, p: Producto) {
    return this.http.put<Producto>(`/api/productos/${id}`, p);
  }
  eliminarProducto(id: number) {
    return this.http.delete<void>(`/api/productos/${id}`);
  }

  deseos(usuarioId: number) {
    return this.http.get<Deseo[]>(`/api/wishlist/${usuarioId}`);
  }
  agregarDeseo(d: { usuarioId: number; productoId: number; cantidadDeseada: number }) {
    return this.http.post<Deseo>('/api/wishlist', d);
  }
  cambiarCantidad(id: number, cantidad: number) {
    return this.http.patch<Deseo>(`/api/wishlist/${id}`, null, { params: { cantidad } });
  }
  quitarDeseo(id: number) {
    return this.http.delete<void>(`/api/wishlist/${id}`);
  }

  historial(usuarioId: number) {
    return this.http.get<Movimiento[]>(`/api/historial/${usuarioId}`);
  }
  registrarMovimiento(m: Movimiento) {
    return this.http.post<Movimiento>('/api/historial', m);
  }

  notificaciones(usuarioId: number) {
    return this.http.get<Notificacion[]>(`/api/notificaciones/${usuarioId}`);
  }
  marcarLeida(id: number) {
    return this.http.patch<Notificacion>(`/api/notificaciones/${id}/leida`, null);
  }
}
