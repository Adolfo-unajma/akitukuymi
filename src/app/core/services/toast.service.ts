import { Injectable, signal } from '@angular/core';

export type TipoToast = 'exito' | 'error' | 'info';

export interface Toast {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private contador = 0;
  readonly toasts = signal<Toast[]>([]);

  mostrar(mensaje: string, tipo: TipoToast = 'info', duracionMs = 3500): void {
    const toast: Toast = { id: ++this.contador, tipo, mensaje };
    this.toasts.update((lista) => [...lista, toast]);
    setTimeout(() => this.cerrar(toast.id), duracionMs);
  }

  exito(mensaje: string): void {
    this.mostrar(mensaje, 'exito');
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error', 5000);
  }

  cerrar(id: number): void {
    this.toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}
