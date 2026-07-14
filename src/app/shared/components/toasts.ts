import { Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  imports: [LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-[70] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      @for (toast of servicio.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 rounded-xl border p-3.5 text-sm shadow-lg backdrop-blur"
          [class]="
            toast.tipo === 'exito'
              ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
              : toast.tipo === 'error'
                ? 'border-red-200 bg-red-50/95 text-red-900'
                : 'border-stone-200 bg-white/95 text-stone-800'
          "
        >
          <lucide-icon
            [name]="
              toast.tipo === 'exito'
                ? 'circle-check'
                : toast.tipo === 'error'
                  ? 'triangle-alert'
                  : 'info'
            "
            [size]="18"
            class="mt-0.5 shrink-0"
          />
          <p class="flex-1">{{ toast.mensaje }}</p>
          <button
            type="button"
            class="cursor-pointer text-stone-400 hover:text-stone-700"
            (click)="servicio.cerrar(toast.id)"
            aria-label="Cerrar notificación"
          >
            <lucide-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  readonly servicio = inject(ToastService);
}
