import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Store } from '../store';

const ACCIONES: Record<string, string> = {
  AGREGADO: 'Agregó',
  ACTUALIZADO: 'Cambió cantidad',
  ELIMINADO: 'Quitó',
};

@Component({
  selector: 'app-historial',
  imports: [DatePipe],
  template: `
    <div class="encabezado">
      <div>
        <h1>Historial</h1>
        <p class="ayuda">Movimientos de tu lista, del más reciente al más antiguo.</p>
      </div>
    </div>

    @if (!movimientos().length) {
      <p class="estado">Aún no hay movimientos. Aparecerán cuando agregues o quites productos.</p>
    } @else {
      <ul class="lista">
        @for (m of movimientos(); track m.id ?? $index) {
          <li class="fila historial">
            <time class="fecha" [attr.datetime]="m.fecha">{{ m.fecha | date: 'd MMM y, h:mm a' }}</time>
            <div class="principal">
              <strong class="nombre">{{ etiqueta(m.accion) }} · {{ nombreProducto(m.productoId) }}</strong>
              @if (m.detalle) {
                <span class="desc">{{ m.detalle }}</span>
              }
            </div>
            <span class="num">{{ m.cantidad ?? '' }}</span>
          </li>
        }
      </ul>
    }
  `,
})
export class HistorialPage {
  private readonly store = inject(Store);

  protected readonly movimientos = computed(() =>
    [...this.store.historial()].sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? '')),
  );

  protected etiqueta(accion: string) {
    return ACCIONES[accion] ?? accion;
  }

  protected nombreProducto(id: number) {
    return this.store.productoPorId().get(id)?.nombre ?? `Producto ${id}`;
  }
}
