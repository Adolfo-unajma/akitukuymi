import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ESTADOS_PEDIDO, EstadoPedido, FLUJO_PEDIDO, Pedido } from '../../core/models';
import { ConfirmacionService } from '../../core/services/confirmacion.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ToastService } from '../../core/services/toast.service';
import { EstadoBadge } from '../../shared/components/estado-badge';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-admin-pedidos',
  imports: [CurrencyPipe, DatePipe, FormsModule, LucideAngularModule, EstadoBadge, Spinner],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-stone-900">Pedidos</h1>
      <button type="button" class="btn-outline !py-2" (click)="cargar()">
        <lucide-icon name="refresh-cw" [size]="15" />
        Actualizar
      </button>
    </div>

    <!-- Filtro por estado -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        type="button"
        class="badge cursor-pointer !px-3 !py-1.5"
        [class]="!filtro() ? 'bg-clay-600 text-white' : 'bg-white text-stone-600 border border-stone-200'"
        (click)="filtro.set(null)"
      >
        Todos ({{ pedidos().length }})
      </button>
      @for (estado of estadosLista; track estado) {
        <button
          type="button"
          class="badge cursor-pointer !px-3 !py-1.5"
          [class]="
            filtro() === estado
              ? 'bg-clay-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200'
          "
          (click)="filtro.set(estado)"
        >
          {{ estados[estado].etiqueta }} ({{ contar(estado) }})
        </button>
      }
    </div>

    @if (cargando()) {
      <app-spinner mensaje="Cargando pedidos…" />
    } @else {
      <div class="card overflow-x-auto">
        <table class="w-full min-w-[44rem] text-sm">
          <thead class="bg-stone-50 text-left text-xs text-stone-500 uppercase">
            <tr>
              <th class="px-4 py-3">Pedido</th>
              <th class="px-4 py-3">Cliente</th>
              <th class="px-4 py-3">Total</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3">Fecha</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            @for (pedido of filtrados(); track pedido.id) {
              <tr class="hover:bg-stone-50">
                <td class="px-4 py-3 font-semibold text-clay-700">{{ pedido.numero_pedido }}</td>
                <td class="px-4 py-3">
                  {{ pedido.usuario?.nombre ?? '—' }} {{ pedido.usuario?.apellidos ?? '' }}
                  <span class="block text-xs text-stone-400">
                    {{ pedido.direccion_envio.telefono }}
                  </span>
                </td>
                <td class="px-4 py-3 font-medium">
                  {{ pedido.monto_total | currency: 'PEN' : 'S/ ' }}
                </td>
                <td class="px-4 py-3"><app-estado-badge [estado]="pedido.estado" /></td>
                <td class="px-4 py-3 text-stone-500">
                  {{ pedido.creado_en | date: 'd MMM, h:mm a' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button type="button" class="btn-ghost !py-1.5" (click)="abrir(pedido)">
                    <lucide-icon name="eye" [size]="16" />
                    Ver
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-10 text-center text-stone-400">
                  No hay pedidos con este filtro
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- ══════ Panel de detalle ══════ -->
    @if (seleccionado(); as p) {
      <div
        class="fixed inset-0 z-[75] flex justify-end bg-stone-900/40 backdrop-blur-sm"
        (click)="seleccionado.set(null)"
      >
        <div
          class="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <header
            class="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white p-5"
          >
            <div>
              <h2 class="font-display text-lg font-bold">{{ p.numero_pedido }}</h2>
              <p class="text-xs text-stone-500">{{ p.creado_en | date: "d 'de' MMMM, h:mm a" }}</p>
            </div>
            <button
              type="button"
              class="btn-ghost !p-2"
              (click)="seleccionado.set(null)"
              aria-label="Cerrar"
            >
              <lucide-icon name="x" [size]="18" />
            </button>
          </header>

          <div class="flex-1 space-y-6 p-5">
            <!-- Cambiar estado -->
            <section>
              <p class="label">Estado del pedido</p>
              <div class="flex gap-2">
                <select class="input flex-1" [(ngModel)]="nuevoEstado">
                  @for (estado of estadosLista; track estado) {
                    <option [value]="estado">{{ estados[estado].etiqueta }}</option>
                  }
                </select>
                <button
                  type="button"
                  class="btn-primary"
                  [disabled]="nuevoEstado === p.estado || actualizando()"
                  (click)="cambiarEstado(p)"
                >
                  Aplicar
                </button>
              </div>
              @if (p.estado === 'pago_subido') {
                <p class="mt-2 flex items-center gap-1.5 text-xs text-sky-700">
                  <lucide-icon name="info" [size]="13" />
                  Revisa el comprobante y pasa el pedido a "Confirmado" si el pago es correcto.
                </p>
              }
            </section>

            <!-- Comprobante -->
            @if (p.comprobante_url) {
              <section>
                <p class="label">Comprobante de pago (op. {{ p.numero_operacion ?? '—' }})</p>
                <img
                  [src]="p.comprobante_url"
                  alt="Comprobante"
                  class="max-h-72 rounded-xl border border-stone-200 object-contain"
                />
              </section>
            }

            <!-- Cliente y entrega -->
            <section class="rounded-xl bg-cream-100 p-4 text-sm">
              <p class="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-stone-800">
                {{ p.direccion_envio.nombre_completo }}
                <span class="flex items-center gap-1 font-normal text-stone-500">
                  <lucide-icon name="phone" [size]="13" /> {{ p.direccion_envio.telefono }}
                </span>
              </p>
              <p class="text-stone-600">
                {{ p.direccion_envio.direccion }}, {{ p.direccion_envio.distrito }},
                {{ p.direccion_envio.ciudad }}
              </p>
              @if (p.direccion_envio.referencia) {
                <p class="text-stone-500">Ref: {{ p.direccion_envio.referencia }}</p>
              }
            </section>

            <!-- Items -->
            <section>
              <p class="label">Productos</p>
              <ul class="divide-y divide-stone-100 rounded-xl border border-stone-200">
                @for (item of p.items ?? []; track item.id) {
                  <li class="flex items-center gap-3 p-3 text-sm">
                    <img
                      [src]="item.imagen_url || '/img/productos/categorias.jpg'"
                      [alt]="item.nombre_producto"
                      class="h-11 w-11 rounded-lg object-cover"
                    />
                    <span class="flex-1">
                      {{ item.nombre_producto }}
                      <span class="block text-xs text-stone-400">
                        {{ item.cantidad }} × {{ item.precio_unitario | currency: 'PEN' : 'S/ ' }}
                      </span>
                    </span>
                    <b>{{ item.subtotal | currency: 'PEN' : 'S/ ' }}</b>
                  </li>
                }
              </ul>
              <p class="mt-3 flex justify-between font-bold">
                Total <span class="text-clay-700">{{ p.monto_total | currency: 'PEN' : 'S/ ' }}</span>
              </p>
            </section>

            <!-- Historial -->
            @if (p.historial?.length) {
              <section>
                <p class="label">Historial</p>
                <ol class="space-y-2 text-sm">
                  @for (h of p.historial; track h.id) {
                    <li class="flex items-center gap-2 text-stone-600">
                      <span class="h-1.5 w-1.5 rounded-full bg-clay-400"></span>
                      {{ estados[h.estado].etiqueta }}
                      <span class="text-xs text-stone-400">
                        {{ h.creado_en | date: 'd MMM, h:mm a' }}
                      </span>
                    </li>
                  }
                </ol>
              </section>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminPedidos {
  private readonly pedidoService = inject(PedidoService);
  private readonly toast = inject(ToastService);
  private readonly confirmacion = inject(ConfirmacionService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly cargando = signal(true);
  readonly filtro = signal<EstadoPedido | null>(null);
  readonly seleccionado = signal<Pedido | null>(null);
  readonly actualizando = signal(false);

  nuevoEstado: EstadoPedido = 'pago_pendiente';

  readonly estados = ESTADOS_PEDIDO;
  readonly estadosLista: EstadoPedido[] = [...FLUJO_PEDIDO, 'cancelado'];

  readonly filtrados = computed(() => {
    const filtro = this.filtro();
    return filtro ? this.pedidos().filter((p) => p.estado === filtro) : this.pedidos();
  });

  constructor() {
    void this.cargar();
  }

  contar(estado: EstadoPedido): number {
    return this.pedidos().filter((p) => p.estado === estado).length;
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.pedidos.set(await this.pedidoService.listarTodos());
    this.cargando.set(false);
  }

  async abrir(pedido: Pedido): Promise<void> {
    // Trae el detalle completo (items + historial)
    const completo = await this.pedidoService.obtener(pedido.id);
    this.seleccionado.set(completo ?? pedido);
    this.nuevoEstado = pedido.estado;
  }

  async cambiarEstado(pedido: Pedido): Promise<void> {
    if (this.nuevoEstado === 'cancelado') {
      const ok = await this.confirmacion.pedir({
        titulo: 'Cancelar pedido',
        mensaje: `¿Seguro que quieres cancelar el pedido ${pedido.numero_pedido}?`,
        textoConfirmar: 'Sí, cancelar',
        peligroso: true,
      });
      if (!ok) return;
    }
    this.actualizando.set(true);
    try {
      await this.pedidoService.cambiarEstado(pedido.id, this.nuevoEstado, 'Actualizado por admin');
      this.toast.exito(
        `El pedido ${pedido.numero_pedido} ahora está en "${this.estados[this.nuevoEstado].etiqueta}"`,
      );
      await this.cargar();
      this.seleccionado.set(await this.pedidoService.obtener(pedido.id));
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo actualizar');
    } finally {
      this.actualizando.set(false);
    }
  }
}
