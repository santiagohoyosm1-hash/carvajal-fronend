export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  categoria: string | null;
  activo: boolean;
}

export interface Deseo {
  id: number;
  usuarioId: number;
  productoId: number;
  cantidadDeseada: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface Movimiento {
  id?: number;
  usuarioId: number;
  productoId: number;
  accion: string;
  cantidad: number | null;
  fecha?: string;
  detalle: string | null;
}

export interface Notificacion {
  id: number;
  usuarioId: number;
  productoId: number | null;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // segundos
  usuarioId: number;
  role: string;
}

export interface Sesion {
  accessToken: string;
  usuarioId: number;
  role: string;
  username: string;
  expiraEn: number; // marca de tiempo en milisegundos
}
