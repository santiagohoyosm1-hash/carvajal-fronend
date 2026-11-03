import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '../store';

@Component({
  selector: 'app-mi-lista',
  imports: [CurrencyPipe, RouterLink],
  template: `
    <div class="encabezado">
      <div>
        <h1>Mi lista</h1>
        <p class="ayuda">Productos que deseas, usuario {{ store.usuarioId() }}.</p>
      </div>
    </div>

    @if (!store.deseos().length) {
      <div class="estado">
        <p>Tu lista está vacía.</p>
        <a class="btn" routerLink="/productos">Ver el catálogo</a>
      </div>
    } @else {
      <ul class="lista">
        <li class="fila cabecera deseos" aria-hidden="true">
          <span>Producto</span>
          <span class="num">Precio</span>
          <span class="centro">Cantidad</span>
          <span class="num">Subtotal</span>
          <span></span>
        </li>
        @for (f of filas(); track f.deseo.id) {
          <li class="fila deseos en-lista">
            <div class="principal">
              @if (f.producto) {
                <strong class="nombre"
                  ><span class="marca">{{ f.producto.nombre }}</span></strong
                >
                @if (f.deseo.cantidadDeseada > f.producto.stock) {
                  <span class="aviso-stock"
                    >Solo hay {{ f.producto.stock }} en stock.</span
                  >
                } @else if (!f.producto.activo) {
                  <span class="aviso-stock">Este producto está inactivo.</span>
                }
              } @else {
                <strong class="nombre">Producto {{ f.deseo.productoId }}</strong>
                <span class="aviso-stock">Ya no está en el catálogo.</span>
              }
            </div>
            <span class="num">
              @if (f.producto) {
                {{ f.producto.precio | currency: undefined : 'symbol-narrow' : '1.0-0' }}
              } @else {
                —
              }
            </span>
            <div class="stepper" role="group" [attr.aria-label]="'Cantidad de ' + (f.producto?.nombre ?? 'producto')">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                [disabled]="store.ocupado() || f.deseo.cantidadDeseada <= 1"
                (click)="store.cambiarCantidad(f.deseo, f.deseo.cantidadDeseada - 1)"
              >
                −
              </button>
              <output>{{ f.deseo.cantidadDeseada }}</output>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                [disabled]="store.ocupado()"
                (click)="store.cambiarCantidad(f.deseo, f.deseo.cantidadDeseada + 1)"
              >
                +
              </button>
            </div>
            <span class="num">
              @if (f.producto) {
                {{ f.producto.precio * f.deseo.cantidadDeseada | currency: undefined : 'symbol-narrow' : '1.0-0' }}
              } @else {
                —
              }
            </span>
            <div class="acciones">
              <button
                type="button"
                class="btn texto peligro"
                [disabled]="store.ocupado()"
                (click)="store.quitar(f.deseo)"
              >
                Quitar
              </button>
            </div>
          </li>
        }
        <li class="fila total">
          <span class="etiqueta-total">Total estimado</span>
          <strong class="num">{{ total() | currency: undefined : 'symbol-narrow' : '1.0-0' }}</strong>
        </li>
      </ul>
    }
  `,
})
export class MiListaPage {
  protected readonly store = inject(Store);

  protected readonly filas = computed(() => {
    const productos = this.store.productoPorId();
    return this.store.deseos().map((deseo) => ({ deseo, producto: productos.get(deseo.productoId) }));
  });

  protected readonly total = computed(() =>
    this.filas().reduce((s, f) => s + (f.producto ? f.producto.precio * f.deseo.cantidadDeseada : 0), 0),
  );
}
