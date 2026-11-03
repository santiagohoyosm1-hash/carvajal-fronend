export const CONFIG = {
  /**
   * El back todavía no genera movimientos de historial automáticamente
   * (ver README del back). Mientras tanto, el front los registra con
   * POST /api/historial después de agregar, cambiar o quitar un deseo.
   * Ponlo en false cuando el back publique esos eventos por RabbitMQ,
   * para no duplicar registros.
   */
  registrarHistorialDesdeFront: true,
};
