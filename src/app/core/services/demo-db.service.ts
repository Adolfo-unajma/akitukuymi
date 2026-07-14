import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const PREFIJO = 'aki_demo_';

/**
 * Mini base de datos local para el MODO DEMO (sin Supabase).
 * Guarda colecciones en localStorage para que los cambios del admin
 * (productos, pedidos, etc.) sobrevivan al recargar la página.
 */
@Injectable({ providedIn: 'root' })
export class DemoDbService {
  private readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  leer<T>(coleccion: string, semilla: T[]): T[] {
    if (!this.enNavegador) return structuredClone(semilla);
    try {
      const crudo = localStorage.getItem(PREFIJO + coleccion);
      if (crudo) return JSON.parse(crudo) as T[];
    } catch {
      /* datos corruptos: se regenera la semilla */
    }
    this.guardar(coleccion, semilla);
    return structuredClone(semilla);
  }

  guardar<T>(coleccion: string, datos: T[]): void {
    if (!this.enNavegador) return;
    try {
      localStorage.setItem(PREFIJO + coleccion, JSON.stringify(datos));
    } catch {
      /* cuota llena (p. ej. imágenes muy pesadas): se ignora en demo */
    }
  }

  uid(): string {
    if (this.enNavegador && 'randomUUID' in crypto) return crypto.randomUUID();
    return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}
