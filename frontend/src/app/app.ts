import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from './store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <div class="barra-in">
        <a class="logo" routerLink="/productos">Wishlist</a>
        <nav aria-label="Secciones">
          <a routerLink="/productos" routerLinkActive="activo">Catálogo</a>
          <a routerLink="/mi-lista" routerLinkActive="activo">
            Mi lista
            @if (store.deseos().length) {
              <span class="contador">{{ store.deseos().length }}</span>
            }
          </a>
          <a routerLink="/historial" routerLinkActive="activo">Historial</a>
          <a routerLink="/notificaciones" routerLinkActive="activo">
            Notificaciones
            @if (store.noLeidas()) {
              <span class="contador alerta" [attr.aria-label]="store.noLeidas() + ' sin leer'">{{
                store.noLeidas()
              }}</span>
            }
          </a>
        </nav>
        <label class="usuario">
          Usuario
          <input
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            [value]="store.usuarioId()"
            (change)="cambiarUsuario($event)"
          />
        </label>
      </div>
    </header>

    <main class="hoja">
      @if (store.avisos().length) {
        <div class="avisos" role="alert">
          <ul>
            @for (a of store.avisos(); track a) {
              <li>{{ a }}</li>
            }
          </ul>
          <button type="button" class="btn texto" (click)="store.descartarAvisos()">Cerrar</button>
        </div>
      }
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly store = inject(Store);

  protected cambiarUsuario(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const n = Number(input.value);
    if (Number.isInteger(n) && n >= 1) {
      this.store.cambiarUsuario(n);
    } else {
      input.value = String(this.store.usuarioId());
    }
  }
}
