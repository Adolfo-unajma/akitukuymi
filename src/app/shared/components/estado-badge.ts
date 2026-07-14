import { Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ESTADOS_PEDIDO, EstadoPedido } from '../../core/models';

@Component({
  selector: 'app-estado-badge',
  imports: [LucideAngularModule],
  template: `
    <span class="badge" [class]="'badge ' + info().clases">
      <lucide-icon [name]="info().icono" [size]="13" />
      {{ info().etiqueta }}
    </span>
  `,
})
export class EstadoBadge {
  readonly estado = input.required<EstadoPedido>();
  readonly info = computed(() => ESTADOS_PEDIDO[this.estado()]);
}
