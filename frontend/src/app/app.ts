import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from './auth';
import { Store } from './store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <div class="barra-in">
        <a class="logo" routerLink="/productos">Wishlist</a>

        @if (auth.sesion(); as sesion) {
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
          <div class="sesion">
            <span class="quien">
              {{ sesion.username }}
              @if (auth.esAdmin()) {
                <span class="rol">Admin</span>
              }
            </span>
            <button type="button" class="btn salir" (click)="auth.cerrarSesion()">Cerrar sesión</button>
          </div>
        }
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
  protected readonly auth = inject(Auth);
  protected readonly store = inject(Store);
}
