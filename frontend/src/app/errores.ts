import { HttpErrorResponse } from '@angular/common/http';

const SIN_CONEXION = 'No hay conexión con el servidor. Revisa tu internet o que el gateway esté en ejecución.';

/** El back responde {mensaje} (errores propios) o {message} (errores de Spring, como el login). */
function detalleDelBack(e: HttpErrorResponse): string {
  const cuerpo = e.error;
  const texto = typeof cuerpo === 'object' && cuerpo !== null ? (cuerpo.mensaje ?? cuerpo.message) : null;
  return typeof texto === 'string' ? texto.trim().replace(/[.\s]+$/, '') : '';
}

export function mensajeError(e: unknown, accion: string): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return SIN_CONEXION;
    if (e.status === 401) return 'Tu sesión venció. Inicia sesión de nuevo.';
    if (e.status === 403) return `${accion}. No tienes permiso para hacerlo.`;

    const detalle = detalleDelBack(e);
    if (detalle && detalle.length < 200 && [400, 404, 409, 503].includes(e.status)) {
      return `${accion}. ${detalle}.`;
    }
    if (e.status === 502 || e.status === 503 || e.status === 504) {
      return `${accion}: el servicio no responde. Intenta de nuevo en unos minutos.`;
    }
    if (e.status === 400) return `${accion}: el servidor rechazó los datos. Revisa los campos.`;
    if (e.status === 404) return `${accion}: no se encontró el recurso.`;
    return `${accion} (error ${e.status}).`;
  }
  return `${accion}.`;
}

export function mensajeLogin(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) return SIN_CONEXION;
    if (e.status === 401) return 'Usuario o contraseña incorrectos.';
    if (e.status === 400) return 'Revisa el usuario y la contraseña.';
    if (e.status >= 500) return 'El servidor no responde ahora. Intenta de nuevo en unos minutos.';
  }
  return 'No se pudo iniciar sesión.';
}
