export const CONFIG = {
  /**
   * ms-wishlist no registra movimientos por sí mismo: el front los envía con
   * POST /api/historial después de agregar, cambiar o quitar un deseo.
   * ms-historial publica el evento en RabbitMQ y ms-notificaciones crea la notificación.
   * Ponlo en false cuando el back registre esos movimientos solo, para no duplicarlos.
   */
  registrarHistorialDesdeFront: true,
};
