import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Solo usuarios con sesión iniciada; si no, manda a /login guardando el destino */
export const authGuard: CanActivateFn = async (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  if (auth.estaAutenticado()) return true;
  return router.createUrlTree(['/login'], { queryParams: { redirigirA: estado.url } });
};

/** Solo administradores */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  return auth.esAdmin() ? true : router.createUrlTree(['/']);
};

/** Solo visitantes (login/registro); si ya hay sesión, manda al inicio */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.listo;
  return auth.estaAutenticado() ? router.createUrlTree(['/']) : true;
};
