import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api } from './api';
import { Auth } from './auth';
import { CONFIG } from './config';
import { mensajeError } from './errores';
import { Deseo, Movimiento, Notificacion, Producto } from './models';

@Injectable({ providedIn: 'root' })
export class Store {
  private readonly api = inject(Api);
  private readonly auth = inject(Auth);

  /** Usuario de la sesión actual (viene del login); null si no hay sesión. */
  readonly usuarioId = computed(() => this.auth.sesion()?.usuarioId ?? null);
  readonly productos = signal<Producto[]>([]);
  readonly deseos = signal<Deseo[]>([]);
  readonly historial = signal<Movimiento[]>([]);
  readonly notificaciones = signal<Notificacion[]>([]);

  readonly cargando = signal(false);
  readonly ocupado = signal(false);
  readonly avisos = signal<string[]>([]);

  readonly productoPorId = computed(() => new Map(this.productos().map((p) => [p.id!, p])));
  readonly deseoPorProducto = computed(() => new Map(this.deseos().map((d) => [d.productoId, d])));
  readonly noLeidas = computed(() => this.notificaciones().filter((n) => !n.leida).length);

  constructor() {
    // Carga los datos al iniciar sesión (o al cambiar de usuario) y los limpia al cerrarla.
    effect(() => {
      const id = this.usuarioId();
      untracked(() => {
        if (id === null) {
          this.limpiar();
          return;
        }
        void this.cargarProductos();
        void this.cargarUsuario(id);
      });
    });
  }

  private limpiar() {
    this.productos.set([]);
    this.deseos.set([]);
    this.historial.set([]);
    this.notificaciones.set([]);
    this.avisos.set([]);
    this.cargando.set(false);
  }

  descartarAvisos() {
    this.avisos.set([]);
  }

  private avisar(texto: string) {
    if (this.auth.sesion() === null) return; // la sesión ya se cerró: el login explica por qué
    this.avisos.update((l) => (l.includes(texto) ? l : [...l, texto]));
  }

  // ---------- Carga ----------

  async cargarProductos() {
    this.cargando.set(true);
    try {
      this.productos.set(await firstValueFrom(this.api.productos()));
    } catch (e) {
      this.avisar(mensajeError(e, 'No se pudo cargar el catálogo'));
    } finally {
      this.cargando.set(false);
    }
  }

  private async cargarUsuario(id: number) {
    this.deseos.set([]);
    this.historial.set([]);
    this.notificaciones.set([]);
    const vigente = () => this.usuarioId() === id;

    await Promise.all([
      firstValueFrom(this.api.deseos(id)).then(
        (d) => vigente() && this.deseos.set(d),
        (e) => this.avisar(mensajeError(e, 'No se pudo cargar tu lista')),
      ),
      firstValueFrom(this.api.historial(id)).then(
        (h) => vigente() && this.historial.set(h),
        (e) => this.avisar(mensajeError(e, 'No se pudo cargar el historial')),
      ),
      firstValueFrom(this.api.notificaciones(id)).then(
        (n) => vigente() && this.notificaciones.set(n),
        (e) => this.avisar(mensajeError(e, 'No se pudieron cargar las notificaciones')),
      ),
    ]);
  }

  // ---------- Productos ----------

  /** Devuelve null si todo salió bien, o el mensaje de error para mostrarlo en el formulario. */
  async guardarProducto(id: number | null, datos: Producto): Promise<string | null> {
    try {
      if (id === null) {
        const nuevo = await firstValueFrom(this.api.crearProducto(datos));
        this.productos.update((l) => [...l, nuevo]);
      } else {
        const editado = await firstValueFrom(this.api.actualizarProducto(id, datos));
        this.productos.update((l) => l.map((p) => (p.id === id ? editado : p)));
      }
      return null;
    } catch (e) {
      return mensajeError(e, 'No se pudo guardar el producto');
    }
  }

  async eliminarProducto(p: Producto) {
    await this.ejecutar('No se pudo eliminar el producto', async () => {
      await firstValueFrom(this.api.eliminarProducto(p.id!));
      this.productos.update((l) => l.filter((x) => x.id !== p.id));
    });
  }

  // ---------- Lista de deseos ----------

  async agregar(p: Producto) {
    const usuarioId = this.usuarioId();
    if (usuarioId === null) return;
    await this.ejecutar('No se pudo agregar a tu lista', async () => {
      const d = await firstValueFrom(
        this.api.agregarDeseo({ usuarioId, productoId: p.id!, cantidadDeseada: 1 }),
      );
      this.deseos.update((l) => [...l.filter((x) => x.id !== d.id), d]);
      await this.registrar({
        usuarioId,
        productoId: p.id!,
        accion: 'AGREGADO',
        cantidad: d.cantidadDeseada,
        detalle: `Agregó "${p.nombre}" a la lista`,
      });
    });
  }

  async cambiarCantidad(d: Deseo, cantidad: number) {
    if (cantidad < 1) return;
    await this.ejecutar('No se pudo cambiar la cantidad', async () => {
      const nuevo = await firstValueFrom(this.api.cambiarCantidad(d.id, cantidad));
      this.deseos.update((l) => l.map((x) => (x.id === d.id ? nuevo : x)));
      const nombre = this.productoPorId().get(d.productoId)?.nombre ?? `producto ${d.productoId}`;
      await this.registrar({
        usuarioId: d.usuarioId,
        productoId: d.productoId,
        accion: 'ACTUALIZADO',
        cantidad,
        detalle: `Cambió la cantidad de "${nombre}" de ${d.cantidadDeseada} a ${cantidad}`,
      });
    });
  }

  async quitar(d: Deseo) {
    await this.ejecutar('No se pudo quitar de tu lista', async () => {
      await firstValueFrom(this.api.quitarDeseo(d.id));
      this.deseos.update((l) => l.filter((x) => x.id !== d.id));
      const nombre = this.productoPorId().get(d.productoId)?.nombre ?? `producto ${d.productoId}`;
      await this.registrar({
        usuarioId: d.usuarioId,
        productoId: d.productoId,
        accion: 'ELIMINADO',
        cantidad: d.cantidadDeseada,
        detalle: `Quitó "${nombre}" de la lista`,
      });
    });
  }

  // ---------- Historial y notificaciones ----------

  private async registrar(m: Movimiento) {
    if (!CONFIG.registrarHistorialDesdeFront) return;
    try {
      const guardado = await firstValueFrom(this.api.registrarMovimiento(m));
      if (this.usuarioId() === m.usuarioId) this.historial.update((l) => [guardado, ...l]);
    } catch (e) {
      this.avisar(mensajeError(e, 'La lista se actualizó, pero no se pudo registrar en el historial'));
    }
  }

  async marcarLeida(n: Notificacion) {
    await this.ejecutar('No se pudo marcar como leída', async () => {
      const nueva = await firstValueFrom(this.api.marcarLeida(n.id));
      this.notificaciones.update((l) => l.map((x) => (x.id === n.id ? nueva : x)));
    });
  }

  private async ejecutar(fallo: string, fn: () => Promise<void>) {
    this.ocupado.set(true);
    try {
      await fn();
    } catch (e) {
      this.avisar(mensajeError(e, fallo));
    } finally {
      this.ocupado.set(false);
    }
  }
}
