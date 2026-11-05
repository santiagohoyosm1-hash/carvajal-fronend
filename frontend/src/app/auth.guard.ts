import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

/** Solo deja entrar con sesión; si no, manda al login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.autenticado() ? true : inject(Router).createUrlTree(['/login']);
};

/** El login no tiene sentido con sesión iniciada: manda al catálogo. */
export const sinSesionGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.autenticado() ? inject(Router).createUrlTree(['/productos']) : true;
};
