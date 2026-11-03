# Wishlist · Frontend (Angular 22)

Interfaz para el back `carvajal-wishlist-microservicios`. No modifica el back: todas las
llamadas van a `/api/...` y el servidor de desarrollo las reenvía al gateway
(`http://localhost:8080`) con `proxy.conf.json`, así que no depende de CORS.

## Requisitos
Node 20.19+ (o 22) y npm. Back arriba: `docker compose up -d` y los 5 servicios Spring Boot.

## Ejecutar
```
npm install
npm start        # http://localhost:4200
```

## Pantallas
- **Catálogo** (`/api/productos`): listar, buscar, crear, editar, eliminar y agregar a mi lista.
- **Mi lista** (`/api/wishlist/{usuarioId}`): cambiar cantidad, quitar, total estimado.
- **Historial** (`/api/historial/{usuarioId}`).
- **Notificaciones** (`/api/notificaciones/{usuarioId}`): marcar como leída.

El back no tiene login: el usuario se elige arriba a la derecha (número, se guarda en el navegador).

## Historial
El back aún no genera movimientos solo. Por eso el front registra uno (`POST /api/historial`)
al agregar, cambiar o quitar un deseo. Cuando el back lo haga por RabbitMQ, pon
`registrarHistorialDesdeFront: false` en `src/app/config.ts` para no duplicar.

## Producción
`npm run build` genera `dist/`. El proxy solo existe en `ng serve`; en un servidor real
(nginx, etc.) hay que reenviar `/api` al gateway.
