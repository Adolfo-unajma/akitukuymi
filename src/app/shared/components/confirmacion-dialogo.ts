import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ConfirmacionService } from '../../core/services/confirmacion.service';

@Component({
  selector: 'app-confirmacion-dialogo',
  imports: [LucideAngularModule],
  template: `
    @if (servicio.estado(); as dialogo) {
      <div
        class="fixed inset-0 z-[80] flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
        (click)="servicio.responder(false)"
      >
        <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
          <div class="flex items-start gap-4">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              [class]="dialogo.peligroso ? 'bg-red-100 text-red-600' : 'bg-clay-100 text-clay-600'"
            >
              <lucide-icon [name]="dialogo.peligroso ? 'triangle-alert' : 'info'" [size]="22" />
            </span>
            <div>
              <h3 class="font-display text-lg font-bold text-stone-900">{{ dialogo.titulo }}</h3>
              <p class="mt-1 text-sm text-stone-600">{{ dialogo.mensaje }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="btn-outline" (click)="servicio.responder(false)">
              {{ dialogo.textoCancelar ?? 'Cancelar' }}
            </button>
            <button
              type="button"
              [class]="dialogo.peligroso ? 'btn-danger' : 'btn-primary'"
              (click)="servicio.responder(true)"
            >
              {{ dialogo.textoConfirmar ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmacionDialogo {
  readonly servicio = inject(ConfirmacionService);
}
