import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from './api';
import { Sesion } from './models';

const CLAVE = 'wishlist.sesion';
const AVISO_VENCIDA = 'Tu sesión venció. Inicia sesión de nuevo.';

function leerSesion(): Sesion | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    if (!crudo) return null;
    const s = JSON.parse(crudo) as Sesion;
    const valida = typeof s?.accessToken === 'string' && typeof s.usuarioId === 'number' && s.expiraEn > Date.now();
    return valida ? s : null;
  } catch {
    return null;
  }
}

/** Sesión del usuario: el token vive en sessionStorage (se borra al cerrar la pestaña). */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  readonly sesion = signal<Sesion | null>(leerSesion());
  /** Mensaje que se muestra en la pantalla de login (por ejemplo, "tu sesión venció"). */
  readonly aviso = signal<string | null>(null);
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly esAdmin = computed(() => this.sesion()?.role === 'ADMIN');

  constructor() {
    this.programarVencimiento(this.sesion());
  }

  async iniciarSesion(username: string, password: string): Promise<void> {
    const nombre = username.trim();
    const r = await firstValueFrom(this.api.login(nombre, password));
    const sesion: Sesion = {
      accessToken: r.accessToken,
      usuarioId: r.usuarioId,
      role: r.role,
      username: nombre.toLowerCase(),
      expiraEn: Date.now() + r.expiresIn * 1000,
    };
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      /* sin almacenamiento: la sesión vive solo en memoria */
    }
    this.aviso.set(null);
    this.sesion.set(sesion);
    this.programarVencimiento(sesion);
  }

  cerrarSesion(aviso: string | null = null): void {
    clearTimeout(this.temporizador);
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      /* nada que limpiar */
    }
    this.sesion.set(null);
    this.aviso.set(aviso);
    void this.router.navigate(['/login']);
  }

  private programarVencimiento(sesion: Sesion | null): void {
    clearTimeout(this.temporizador);
    if (!sesion) return;
    const faltan = Math.max(sesion.expiraEn - Date.now(), 0);
    this.temporizador = setTimeout(() => this.cerrarSesion(AVISO_VENCIDA), faltan);
  }
}
