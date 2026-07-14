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
    <article
      class="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg"
    >
      <a [routerLink]="['/catalogo', producto().id]" class="relative block overflow-hidden">
        <img
          [src]="producto().imagen_url || '/img/productos/categorias.jpg'"
          [alt]="producto().nombre"
          loading="lazy"
          class="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
        @if (producto().precio_oferta) {
          <span class="badge absolute top-3 left-3 bg-clay-600 text-white shadow">
            <lucide-icon name="sparkles" [size]="12" />
            Oferta
          </span>
        }
        @if (producto().stock === 0) {
          <span class="badge absolute top-3 right-3 bg-stone-800/90 text-white">Agotado</span>
        }
      </a>

      <div class="flex flex-1 flex-col gap-1 p-4">
        @if (producto().categoria; as cat) {
          <span class="text-xs font-medium tracking-wide text-andes-600 uppercase">
            {{ cat.nombre }}
          </span>
        }
        <a
          [routerLink]="['/catalogo', producto().id]"
          class="font-display font-semibold text-stone-800 hover:text-clay-700"
        >
          {{ producto().nombre }}
        </a>

        <div class="mt-auto flex items-end justify-between pt-3">
          <div>
            @if (producto().precio_oferta) {
              <span class="mr-1.5 text-sm text-stone-400 line-through">
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
            class="btn-primary !p-2.5"
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
