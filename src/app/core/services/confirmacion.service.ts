import { Injectable, signal } from '@angular/core';

export interface OpcionesConfirmacion {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligroso?: boolean;
}

interface EstadoConfirmacion extends OpcionesConfirmacion {
  resolver: (confirmado: boolean) => void;
}

/** Diálogo de confirmación global (el componente vive en el root de la app) */
@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  readonly estado = signal<EstadoConfirmacion | null>(null);

  pedir(opciones: OpcionesConfirmacion): Promise<boolean> {
    return new Promise((resolver) => {
      this.estado.set({ ...opciones, resolver });
    });
  }

  responder(confirmado: boolean): void {
    this.estado()?.resolver(confirmado);
    this.estado.set(null);
  }
}
