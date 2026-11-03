import { HttpErrorResponse } from '@angular/common/http';

export function mensajeError(e: unknown, accion: string): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) {
      return 'No hay conexión con el gateway (puerto 8080). Revisa que esté en ejecución.';
    }
    if (e.status === 502 || e.status === 503 || e.status === 504) {
      return `${accion}: el microservicio no responde. Revisa que esté en ejecución.`;
    }
    if (e.status === 400) {
      return `${accion}: el servidor rechazó los datos. Revisa los campos.`;
    }
    if (e.status === 404) {
      return `${accion}: no se encontró el recurso.`;
    }
    return `${accion} (error ${e.status}).`;
  }
  return `${accion}.`;
}
