import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { precioVenta } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { ConfirmacionService } from '../../core/services/confirmacion.service';

@Component({
  selector: 'app-carrito',
  imports: [CurrencyPipe, RouterLink, LucideAngularModule],
  template: `
    <div class="container-app py-10">
      <h1 class="font-display mb-8 text-3xl font-bold text-stone-900 sm:text-4xl">Mi carrito</h1>

      @if (carrito.items().length === 0) {
        <div class="card mx-auto flex max-w-md flex-col items-center gap-4 p-12 text-center">
          <span class="flex h-20 w-20 items-center justify-center rounded-full bg-cream-100">
            <lucide-icon name="shopping-cart" [size]="36" class="text-stone-400" />
          </span>
          <p class="font-display text-xl font-semibold text-stone-800">Tu carrito está vacío</p>
          <p class="text-sm text-stone-500">
            Descubre nuestros tejidos artesanales y llena tu carrito de cariño.
          </p>
          <a routerLink="/catalogo" class="btn-primary mt-2">
            Explorar catálogo
            <lucide-icon name="arrow-right" [size]="16" />
          </a>
        </div>
      } @else {
        <div class="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
          <!-- Items -->
          <div class="card divide-y divide-stone-100">
            @for (item of carrito.items(); track item.producto.id) {
              <div class="flex gap-4 p-4 sm:p-5">
                <a [routerLink]="['/catalogo', item.producto.id]" class="shrink-0">
                  <img
                    [src]="item.producto.imagen_url || '/img/productos/categorias.jpg'"
                    [alt]="item.producto.nombre"
                    class="h-24 w-24 rounded-xl object-cover"
                  />
                </a>
                <div class="flex flex-1 flex-col">
                  <div class="flex items-start justify-between gap-3">
                    <a
                      [routerLink]="['/catalogo', item.producto.id]"
                      class="font-display font-semibold text-stone-800 hover:text-clay-700"
                    >
                      {{ item.producto.nombre }}
                    </a>
                    <button
                      type="button"
                      class="cursor-pointer text-stone-400 hover:text-red-600"
                      (click)="carrito.quitar(item.producto.id)"
                      aria-label="Quitar del carrito"
                    >
                      <lucide-icon name="trash-2" [size]="17" />
                    </button>
                  </div>
                  <p class="text-sm text-stone-500">
                    {{ precio(item.producto) | currency: 'PEN' : 'S/ ' }} c/u
                  </p>

                  <div class="mt-auto flex items-center justify-between pt-3">
                    <div class="flex items-center rounded-full border border-stone-200">
                      <button
                        type="button"
                        class="btn-ghost !p-2"
                        (click)="carrito.cambiarCantidad(item.producto.id, item.cantidad - 1)"
                        aria-label="Disminuir"
                      >
                        <lucide-icon name="minus" [size]="14" />
                      </button>
                      <span class="w-8 text-center text-sm font-semibold">{{ item.cantidad }}</span>
                      <button
                        type="button"
                        class="btn-ghost !p-2"
                        (click)="carrito.cambiarCantidad(item.producto.id, item.cantidad + 1)"
                        aria-label="Aumentar"
                      >
                        <lucide-icon name="plus" [size]="14" />
                      </button>
                    </div>
                    <span class="font-bold text-clay-700">
                      {{ precio(item.producto) * item.cantidad | currency: 'PEN' : 'S/ ' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Resumen -->
          <aside class="card sticky top-24 p-6">
            <h2 class="font-display text-lg font-bold text-stone-900">Resumen</h2>
            <dl class="mt-4 space-y-2.5 text-sm">
              <div class="flex justify-between">
                <dt class="text-stone-500">Productos ({{ carrito.cantidadTotal() }})</dt>
                <dd class="font-medium">{{ carrito.total() | currency: 'PEN' : 'S/ ' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-stone-500">Envío</dt>
                <dd class="text-andes-600">Se coordina por WhatsApp</dd>
              </div>
            </dl>
            <div
              class="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg font-bold"
            >
              <span>Total</span>
              <span class="text-clay-700">{{ carrito.total() | currency: 'PEN' : 'S/ ' }}</span>
            </div>

            <button type="button" class="btn-primary mt-6 w-full !py-3" (click)="irACheckout()">
              Continuar compra
              <lucide-icon name="arrow-right" [size]="17" />
            </button>
            <button type="button" class="btn-ghost mt-2 w-full" (click)="vaciar()">
              Vaciar carrito
            </button>

            <p class="mt-4 flex items-center gap-2 text-xs text-stone-500">
              <lucide-icon name="qr-code" [size]="14" class="shrink-0 text-andes-600" />
              Pago seguro con Yape: escaneas el QR y subes tu comprobante.
            </p>
          </aside>
        </div>
      }
    </div>
  `,
})
export class Carrito {
  readonly carrito = inject(CarritoService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirmacion = inject(ConfirmacionService);

  precio = precioVenta;

  irACheckout(): void {
    if (this.auth.estaAutenticado()) {
      void this.router.navigate(['/checkout']);
    } else {
      void this.router.navigate(['/login'], { queryParams: { redirigirA: '/checkout' } });
    }
  }

  async vaciar(): Promise<void> {
    const ok = await this.confirmacion.pedir({
      titulo: 'Vaciar carrito',
      mensaje: '¿Seguro que quieres quitar todos los productos del carrito?',
      textoConfirmar: 'Sí, vaciar',
      peligroso: true,
    });
    if (ok) this.carrito.vaciar();
  }
}
