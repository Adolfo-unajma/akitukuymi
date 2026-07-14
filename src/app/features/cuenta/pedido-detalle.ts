import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ESTADOS_PEDIDO, FLUJO_PEDIDO, Pedido } from '../../core/models';
import { ConfirmacionService } from '../../core/services/confirmacion.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ToastService } from '../../core/services/toast.service';
import { EstadoBadge } from '../../shared/components/estado-badge';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-pedido-detalle',
  imports: [CurrencyPipe, DatePipe, RouterLink, LucideAngularModule, EstadoBadge, Spinner],
  template: `
    <div class="container-app max-w-4xl py-10">
      @if (cargando()) {
        <app-spinner mensaje="Cargando pedido…" />
      } @else if (pedido(); as p) {
        <a routerLink="/mis-pedidos" class="btn-ghost mb-5 -ml-3">
          <lucide-icon name="arrow-left" [size]="16" />
          Volver a mis pedidos
        </a>

        <div class="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="font-display text-3xl font-bold text-stone-900">
              {{ p.numero_pedido }}
            </h1>
            <p class="text-sm text-stone-500">
              Realizado el {{ p.creado_en | date: "d 'de' MMMM, y - h:mm a" }}
            </p>
          </div>
          <app-estado-badge [estado]="p.estado" />
        </div>

        <!-- Línea de tiempo -->
        @if (p.estado !== 'cancelado') {
          <div class="card mb-8 overflow-x-auto p-6">
            <ol class="flex min-w-max items-start">
              @for (estado of flujo; track estado; let i = $index) {
                <li class="flex items-start">
                  <div class="flex w-24 flex-col items-center text-center">
                    <span
                      class="flex h-10 w-10 items-center justify-center rounded-full border-2"
                      [class]="
                        indiceActual() >= i
                          ? 'border-andes-600 bg-andes-600 text-white'
                          : 'border-stone-200 bg-white text-stone-300'
                      "
                    >
                      <lucide-icon [name]="estados[estado].icono" [size]="17" />
                    </span>
                    <p
                      class="mt-2 text-[11px] leading-tight font-medium"
                      [class]="indiceActual() >= i ? 'text-stone-800' : 'text-stone-400'"
                    >
                      {{ estados[estado].etiqueta }}
                    </p>
                  </div>
                  @if (i < flujo.length - 1) {
                    <span
                      class="mt-5 h-0.5 w-8 sm:w-12"
                      [class]="indiceActual() > i ? 'bg-andes-600' : 'bg-stone-200'"
                    ></span>
                  }
                </li>
              }
            </ol>
            <p class="mt-5 rounded-xl bg-cream-100 p-3 text-sm text-stone-600">
              <lucide-icon name="info" [size]="14" class="mr-1 inline" />
              {{ estados[p.estado].descripcion }}
            </p>
          </div>
        }

        <div class="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
          <!-- Productos -->
          <div class="card divide-y divide-stone-100">
            @for (item of p.items ?? []; track item.id) {
              <div class="flex items-center gap-4 p-4">
                <img
                  [src]="item.imagen_url || '/img/productos/categorias.jpg'"
                  [alt]="item.nombre_producto"
                  class="h-16 w-16 rounded-xl object-cover"
                />
                <div class="flex-1">
                  <p class="font-medium text-stone-800">{{ item.nombre_producto }}</p>
                  <p class="text-sm text-stone-500">
                    {{ item.cantidad }} × {{ item.precio_unitario | currency: 'PEN' : 'S/ ' }}
                  </p>
                </div>
                <p class="font-semibold text-stone-800">
                  {{ item.subtotal | currency: 'PEN' : 'S/ ' }}
                </p>
              </div>
            }
            <p class="flex justify-between p-4 text-lg font-bold">
              Total
              <span class="text-clay-700">{{ p.monto_total | currency: 'PEN' : 'S/ ' }}</span>
            </p>
          </div>

          <!-- Lateral -->
          <div class="space-y-5">
            <div class="card p-5 text-sm">
              <h3 class="font-display mb-3 flex items-center gap-2 font-bold">
                <lucide-icon name="map-pin" [size]="16" class="text-clay-600" />
                Entrega
              </h3>
              <p class="font-medium text-stone-800">{{ p.direccion_envio.nombre_completo }}</p>
              <p class="text-stone-600">
                {{ p.direccion_envio.direccion }}, {{ p.direccion_envio.distrito }},
                {{ p.direccion_envio.ciudad }}
              </p>
              @if (p.direccion_envio.referencia) {
                <p class="text-stone-500">Ref: {{ p.direccion_envio.referencia }}</p>
              }
              <p class="mt-1 flex items-center gap-1.5 text-stone-500">
                <lucide-icon name="phone" [size]="13" /> {{ p.direccion_envio.telefono }}
              </p>
            </div>

            <div class="card p-5 text-sm">
              <h3 class="font-display mb-3 flex items-center gap-2 font-bold">
                <lucide-icon name="banknote" [size]="16" class="text-clay-600" />
                Pago
              </h3>
              <p class="text-stone-600">Método: <b class="text-stone-800">Yape</b></p>
              @if (p.numero_operacion) {
                <p class="text-stone-600">
                  Operación: <b class="text-stone-800">{{ p.numero_operacion }}</b>
                </p>
              }
              @if (p.comprobante_url) {
                <img
                  [src]="p.comprobante_url"
                  alt="Comprobante de pago"
                  class="mt-3 max-h-44 rounded-xl border border-stone-200 object-contain"
                />
              }
            </div>

            @if (p.historial?.length) {
              <div class="card p-5 text-sm">
                <h3 class="font-display mb-3 flex items-center gap-2 font-bold">
                  <lucide-icon name="clock" [size]="16" class="text-clay-600" />
                  Historial
                </h3>
                <ol class="space-y-3">
                  @for (h of historialOrdenado(); track h.id) {
                    <li class="flex gap-3">
                      <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay-400"></span>
                      <div>
                        <p class="font-medium text-stone-800">
                          {{ estados[h.estado].etiqueta }}
                        </p>
                        @if (h.notas) {
                          <p class="text-xs text-stone-500">{{ h.notas }}</p>
                        }
                        <p class="text-xs text-stone-400">
                          {{ h.creado_en | date: 'd MMM, h:mm a' }}
                        </p>
                      </div>
                    </li>
                  }
                </ol>
              </div>
            }

            @if (p.estado === 'pago_pendiente' || p.estado === 'pago_subido') {
              <button type="button" class="btn-danger w-full" (click)="cancelar()">
                <lucide-icon name="circle-x" [size]="16" />
                Cancelar pedido
              </button>
            }
          </div>
        </div>
      } @else {
        <div class="card mx-auto max-w-md p-10 text-center">
          <p class="font-display text-lg font-semibold">Pedido no encontrado</p>
          <a routerLink="/mis-pedidos" class="btn-primary mt-4">Ver mis pedidos</a>
        </div>
      }
    </div>
  `,
})
export class PedidoDetalle {
  private readonly pedidoService = inject(PedidoService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly toast = inject(ToastService);

  readonly pedido = signal<Pedido | null>(null);
  readonly cargando = signal(true);

  readonly flujo = FLUJO_PEDIDO;
  readonly estados = ESTADOS_PEDIDO;

  readonly indiceActual = computed(() => {
    const p = this.pedido();
    return p ? this.flujo.indexOf(p.estado) : -1;
  });

  readonly historialOrdenado = computed(() =>
    [...(this.pedido()?.historial ?? [])].sort((a, b) => b.creado_en.localeCompare(a.creado_en)),
  );

  constructor() {
    const id = this.ruta.snapshot.paramMap.get('id');
    if (id) void this.cargar(id);
  }

  private async cargar(id: string): Promise<void> {
    this.cargando.set(true);
    this.pedido.set(await this.pedidoService.obtener(id));
    this.cargando.set(false);
  }

  async cancelar(): Promise<void> {
    const p = this.pedido();
    if (!p) return;
    const ok = await this.confirmacion.pedir({
      titulo: 'Cancelar pedido',
      mensaje: `¿Seguro que quieres cancelar el pedido ${p.numero_pedido}? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, cancelar',
      peligroso: true,
    });
    if (!ok) return;
    await this.pedidoService.cambiarEstado(p.id, 'cancelado', 'Cancelado por el cliente');
    this.toast.mostrar('Tu pedido fue cancelado', 'info');
    await this.cargar(p.id);
  }
}
