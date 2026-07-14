import { environment } from '../../environments/environment';

/** ¿La tienda está en modo demostración (solo lectura)? */
export function esSoloLectura(): boolean {
  return environment.soloLectura === true;
}

/**
 * Corta cualquier operación de escritura cuando el modo demostración está
 * activo. Los componentes ya muestran `error.message` en un toast, así que el
 * usuario ve un aviso claro en vez de que "no pase nada".
 */
export function assertEscritura(): void {
  if (environment.soloLectura) {
    throw new Error(
      'Modo demostración: esta es una vista de prueba. Puedes navegar y usar el asistente, pero los cambios están desactivados.',
    );
  }
}
