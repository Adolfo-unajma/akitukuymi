import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Pedido, Producto } from '../../core/models';
import { PedidoService } from '../../core/services/pedido.service';
import { ProductoService } from '../../core/services/producto.service';
import { EstadoBadge } from '../../shared/components/estado-badge';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, LucideAngularModule, EstadoBadge],
  template: `
    <h1 class="font-display mb-6 text-2xl font-bold text-stone-900">Dashboard</h1>

    <!-- Tarjetas de resumen -->
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-stone-500">Ventas confirmadas</p>
          <span class="rounded-xl bg-andes-100 p-2 text-andes-700">
            <lucide-icon name="banknote" [size]="18" />
          </span>
        </div>
        <p class="mt-2 text-2xl font-bold text-stone-900">
          {{ totalVentas() | currency: 'PEN' : 'S/ ' }}
        </p>
      </div>

      <div class="card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-stone-500">Pagos por verificar</p>
          <span class="rounded-xl bg-sky-100 p-2 text-sky-700">
            <lucide-icon name="qr-code" [size]="18" />
          </span>
        </div>
        <p class="mt-2 text-2xl font-bold text-stone-900">{{ porVerificar() }}</p>
        <a
          routerLink="/admin/pedidos"
          class="flex items-center gap-1 text-xs font-medium text-clay-700 hover:underline"
        >
          Revisar ahora <lucide-icon name="arrow-right" [size]="12" />
        </a>
      </div>

      <div class="card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-stone-500">Pedidos en proceso</p>
          <span class="rounded-xl bg-violet-100 p-2 text-violet-700">
            <lucide-icon name="truck" [size]="18" />
          </span>
        </div>
        <p class="mt-2 text-2xl font-bold text-stone-900">{{ enProceso() }}</p>
      </div>

      <div class="card p-5">
        <div class="flex items-center justify-between">
          <p class="text-sm text-stone-500">Stock bajo (≤ 3)</p>
          <span class="rounded-xl bg-red-100 p-2 text-red-700">
            <lucide-icon name="triangle-alert" [size]="18" />
          </span>
        </div>
        <p class="mt-2 text-2xl font-bold text-stone-900">{{ stockBajo().length }}</p>
      </div>
    </div>

    <div class="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_20rem]">
      <!-- Últimos pedidos -->
      <section class="card overflow-hidden">
        <header class="flex items-center justify-between border-b border-stone-100 p-4">
          <h2 class="font-display font-bold text-stone-900">Últimos pedidos</h2>
          <a routerLink="/admin/pedidos" class="text-sm font-medium text-clay-700 hover:underline">
            Ver todos
          </a>
        </header>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-stone-50 text-left text-xs text-stone-500 uppercase">
              <tr>
                <th class="px-4 py-3">Pedido</th>
                <th class="px-4 py-3">Cliente</th>
                <th class="px-4 py-3">Total</th>
                <th class="px-4 py-3">Estado</th>
                <th class="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              @for (pedido of pedidos().slice(0, 8); track pedido.id) {
                <tr class="hover:bg-stone-50">
                  <td class="px-4 py-3 font-semibold text-clay-700">
                    {{ pedido.numero_pedido }}
                  </td>
                  <td class="px-4 py-3">{{ pedido.usuario?.nombre ?? '—' }}</td>
                  <td class="px-4 py-3 font-medium">
                    {{ pedido.monto_total | currency: 'PEN' : 'S/ ' }}
                  </td>
                  <td class="px-4 py-3"><app-estado-badge [estado]="pedido.estado" /></td>
                  <td class="px-4 py-3 text-stone-500">
                    {{ pedido.creado_en | date: 'd MMM, h:mm a' }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-stone-400">
                    Aún no hay pedidos registrados
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <!-- Stock bajo -->
      <section class="card p-5">
        <h2 class="font-display mb-4 font-bold text-stone-900">Stock bajo</h2>
        @if (stockBajo().length === 0) {
          <p class="flex items-center gap-1.5 text-sm text-stone-400">
            <lucide-icon name="circle-check" [size]="15" class="text-andes-600" />
            Todo el inventario está saludable
          </p>
        }
        <ul class="space-y-3">
          @for (producto of stockBajo(); track producto.id) {
            <li class="flex items-center gap-3 text-sm">
              <img
                [src]="producto.imagen_url || '/img/productos/categorias.jpg'"
                [alt]="producto.nombre"
                class="h-10 w-10 rounded-lg object-cover"
              />
              <span class="flex-1 truncate">{{ producto.nombre }}</span>
              <span
                class="badge"
                [class]="producto.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'"
              >
                {{ producto.stock }} uds.
              </span>
            </li>
          }
        </ul>
      </section>
    </div>
  `,
})
export class Dashboard {
  private readonly pedidoService = inject(PedidoService);
  private readonly productoService = inject(ProductoService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly productos = signal<Producto[]>([]);

  readonly totalVentas = signal(0);
  readonly porVerificar = signal(0);
  readonly enProceso = signal(0);
  readonly stockBajo = signal<Producto[]>([]);

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    const [pedidos, productos] = await Promise.all([
      this.pedidoService.listarTodos(),
      this.productoService.listarTodos(),
    ]);
    this.pedidos.set(pedidos);
    this.productos.set(productos);

    const confirmados = pedidos.filter((p) =>
      ['confirmado', 'empaquetado', 'en_camino', 'entregado'].includes(p.estado),
    );
    this.totalVentas.set(confirmados.reduce((acc, p) => acc + p.monto_total, 0));
    this.porVerificar.set(pedidos.filter((p) => p.estado === 'pago_subido').length);
    this.enProceso.set(
      pedidos.filter((p) => ['confirmado', 'empaquetado', 'en_camino'].includes(p.estado)).length,
    );
    this.stockBajo.set(productos.filter((p) => p.activo && p.stock <= 3).slice(0, 8));
  }
}
