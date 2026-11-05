import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from './auth';

/** Agrega "Authorization: Bearer <token>" a las llamadas a /api y cierra la sesión si el back responde 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const esApi = req.url.startsWith('/api/');
  const esLogin = req.url === '/api/auth/login';
  const token = auth.sesion()?.accessToken;

  const peticion =
    esApi && !esLogin && token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((e: unknown) => {
      if (e instanceof HttpErrorResponse && e.status === 401 && esApi && !esLogin && auth.sesion()) {
        auth.cerrarSesion('Tu sesión venció. Inicia sesión de nuevo.');
      }
      return throwError(() => e);
    }),
  );
};
