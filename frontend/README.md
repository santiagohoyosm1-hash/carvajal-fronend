# Wishlist · Frontend (Angular 22)

Interfaz para el back `carvajal-backend` (gateway + microservicios con JWT).

## Requisitos
Node 20.19+ (o 22) y npm. Para probar en local, el back arriba con el gateway en `http://localhost:8080`.

## Ejecutar
```
npm install
npm start        # http://localhost:4200
```
`proxy.conf.json` reenvía `/api/*` al gateway local (`localhost:8080`), así no hay problemas de CORS.

## Sesión (JWT)
- Pantalla de login (`POST /api/auth/login`). Sin sesión, cualquier ruta redirige a `/login`.
- El token se guarda en `sessionStorage` (se borra al cerrar la pestaña) y un interceptor lo envía en
  `Authorization: Bearer ...` en cada llamada a `/api`.
- Si el token vence (15 minutos) o el back responde 401, se cierra la sesión y el login lo avisa.
- El `usuarioId` sale de la respuesta del login; ya no hay selector de usuario.
- Las cuentas las crea el administrador en el back (`POST /api/auth/users`); el front no registra usuarios.

## Pantallas
- **Catálogo** (`/api/productos`): listar, buscar, crear, editar, eliminar y agregar a mi lista.
  El back solo lista productos activos; al desactivar uno deja de aparecer.
- **Mi lista** (`/api/wishlist/{usuarioId}`): cambiar cantidad (valida stock en el back), quitar, total.
- **Historial** (`/api/historial/{usuarioId}`).
- **Notificaciones** (`/api/notificaciones/{usuarioId}`): marcar como leída.

## Historial
`ms-wishlist` no registra movimientos por sí mismo: el front envía `POST /api/historial` al agregar,
cambiar o quitar un deseo. `ms-historial` publica el evento en RabbitMQ y `ms-notificaciones` crea la
notificación. Si el back pasa a registrarlos solo, pon `registrarHistorialDesdeFront: false` en
`src/app/config.ts`.

## Despliegue en Vercel
- Root Directory `frontend`, Build Command `npm run build`, Output Directory `dist/frontend/browser`.
- `vercel.json` reenvía `/api/*` al gateway en Railway y deja el resto a Angular. El destino debe ser
  el dominio público del **gateway** (no el de los microservicios). Si cambia, edita esa línea.
