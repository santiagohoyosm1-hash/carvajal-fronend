import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Store } from '../store';

@Component({
  selector: 'app-notificaciones',
  imports: [DatePipe],
  template: `
    <div class="encabezado">
      <div>
        <h1>Notificaciones</h1>
        <p class="ayuda">Avisos de tu cuenta.</p>
      </div>
    </div>

    @if (!ordenadas().length) {
      <p class="estado">No tienes notificaciones.</p>
    } @else {
      <ul class="lista">
        @for (n of ordenadas(); track n.id) {
          <li class="fila notificacion" [class.sin-leer]="!n.leida">
            <div class="principal">
              <strong class="nombre">{{ n.mensaje }}</strong>
              <span class="desc">
                <time [attr.datetime]="n.fecha">{{ n.fecha | date: 'd MMM y, h:mm a' }}</time>
                @if (n.productoId) {
                  · {{ nombreProducto(n.productoId) }}
                }
              </span>
            </div>
            <div class="acciones">
              @if (n.leida) {
                <span class="etiqueta">Leída</span>
              } @else {
                <button
                  type="button"
                  class="btn sec"
                  [disabled]="store.ocupado()"
                  (click)="store.marcarLeida(n)"
                >
                  Marcar como leída
                </button>
              }
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class NotificacionesPage {
  protected readonly store = inject(Store);

  protected readonly ordenadas = computed(() =>
    [...this.store.notificaciones()].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  protected nombreProducto(id: number) {
    return this.store.productoPorId().get(id)?.nombre ?? `Producto ${id}`;
  }
}
