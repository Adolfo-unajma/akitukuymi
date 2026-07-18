import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Producto, precioVenta } from '../../core/models';
import { CarritoService } from '../../core/services/carrito.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-producto-card',
  imports: [CurrencyPipe, RouterLink, LucideAngularModule],
  template: `
    <article class="card card-hover group flex h-full flex-col overflow-hidden">
      <a
        [routerLink]="['/catalogo', producto().id]"
        class="relative block overflow-hidden bg-cream-100"
      >
        <img
          [src]="producto().imagen_url || '/img/productos/categorias.jpg'"
          [alt]="producto().nombre"
          loading="lazy"
          class="aspect-square w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        ></div>
        @if (producto().precio_oferta) {
          <span class="badge absolute top-3 left-3 bg-clay-600 text-white shadow-sm">
            <lucide-icon name="sparkles" [size]="12" />
            Oferta
          </span>
        }
        @if (producto().stock === 0) {
          <span
            class="badge absolute inset-x-0 bottom-0 justify-center rounded-none bg-stone-800/85 py-1.5 text-white backdrop-blur-sm"
          >
            Agotado
          </span>
        }
      </a>

      <div class="flex flex-1 flex-col p-4">
        @if (producto().categoria; as cat) {
          <span class="mb-1 text-[11px] font-semibold tracking-wider text-andes-600 uppercase">
            {{ cat.nombre }}
          </span>
        }
        <a
          [routerLink]="['/catalogo', producto().id]"
          class="font-display leading-snug font-semibold text-stone-800 transition-colors group-hover:text-clay-700"
        >
          {{ producto().nombre }}
        </a>

        <div class="mt-auto flex items-end justify-between pt-4">
          <div class="flex flex-col">
            @if (producto().precio_oferta) {
              <span class="text-xs text-stone-400 line-through">
                {{ producto().precio | currency: 'PEN' : 'S/ ' }}
              </span>
            }
            <span class="text-lg font-bold text-clay-700">
              {{ precioFinal | currency: 'PEN' : 'S/ ' }}
            </span>
          </div>
          <button
            type="button"
            (click)="agregar()"
            [disabled]="producto().stock === 0"
            class="btn-primary !p-2.5 transition-transform group-hover:scale-105"
            [attr.aria-label]="'Agregar ' + producto().nombre + ' al carrito'"
          >
            <lucide-icon name="shopping-cart" [size]="17" />
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductoCard {
  readonly producto = input.required<Producto>();

  private readonly carrito = inject(CarritoService);
  private readonly toast = inject(ToastService);

  get precioFinal(): number {
    return precioVenta(this.producto());
  }

  agregar(): void {
    if (this.carrito.agregar(this.producto())) {
      this.toast.exito(`"${this.producto().nombre}" se agregó al carrito`);
    } else {
      this.toast.error('No hay más stock disponible de este producto');
    }
  }
}
