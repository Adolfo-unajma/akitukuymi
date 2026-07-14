import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Pedido } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { PedidoService } from '../../core/services/pedido.service';
import { EstadoBadge } from '../../shared/components/estado-badge';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-mis-pedidos',
  imports: [CurrencyPipe, DatePipe, RouterLink, LucideAngularModule, EstadoBadge, Spinner],
  template: `
    <div class="container-app max-w-4xl py-10">
      <h1 class="font-display mb-8 text-3xl font-bold text-stone-900">Mis pedidos</h1>

      @if (cargando()) {
        <app-spinner mensaje="Cargando tus pedidos…" />
      } @else if (pedidos().length === 0) {
        <div class="card flex flex-col items-center gap-4 p-12 text-center">
          <span class="flex h-20 w-20 items-center justify-center rounded-full bg-cream-100">
            <lucide-icon name="package" [size]="36" class="text-stone-400" />
          </span>
          <p class="font-display text-xl font-semibold text-stone-800">
            Aún no tienes pedidos
          </p>
          <p class="text-sm text-stone-500">Cuando compres, aquí podrás seguir cada pedido.</p>
          <a routerLink="/catalogo" class="btn-primary mt-2">
            Ir al catálogo
            <lucide-icon name="arrow-right" [size]="16" />
          </a>
        </div>
      } @else {
        <div class="space-y-4">
          @for (pedido of pedidos(); track pedido.id) {
            <a
              [routerLink]="['/mis-pedidos', pedido.id]"
              class="card block p-5 transition hover:border-clay-300 hover:shadow-md"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-display font-bold text-stone-900">
                    {{ pedido.numero_pedido }}
                  </p>
                  <p class="text-xs text-stone-500">
                    {{ pedido.creado_en | date: "d 'de' MMMM, y - h:mm a" }}
                  </p>
                </div>
                <app-estado-badge [estado]="pedido.estado" />
              </div>

              <div class="mt-4 flex items-center justify-between gap-3">
                <div class="flex -space-x-3">
                  @for (item of (pedido.items ?? []).slice(0, 4); track item.id) {
                    <img
                      [src]="item.imagen_url || '/img/productos/categorias.jpg'"
                      [alt]="item.nombre_producto"
                      class="h-11 w-11 rounded-full border-2 border-white object-cover"
                    />
                  }
                  @if ((pedido.items ?? []).length > 4) {
                    <span
                      class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-stone-100 text-xs font-bold text-stone-600"
                    >
                      +{{ (pedido.items ?? []).length - 4 }}
                    </span>
                  }
                </div>
                <p class="font-bold text-clay-700">
                  {{ pedido.monto_total | currency: 'PEN' : 'S/ ' }}
                </p>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
})
export class MisPedidos {
  private readonly pedidoService = inject(PedidoService);
  private readonly auth = inject(AuthService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly cargando = signal(true);

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    const usuario = this.auth.usuario();
    if (usuario) {
      this.pedidos.set(await this.pedidoService.misPedidos(usuario.id));
    }
    this.cargando.set(false);
  }
}
