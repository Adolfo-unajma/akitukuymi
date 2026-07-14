import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrandWhatsapp } from '@ng-icons/tabler-icons';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { Producto, precioVenta } from '../../core/models';
import { CarritoService } from '../../core/services/carrito.service';
import { ProductoService } from '../../core/services/producto.service';
import { ToastService } from '../../core/services/toast.service';
import { ProductoCard } from '../../shared/components/producto-card';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, RouterLink, LucideAngularModule, NgIcon, ProductoCard, Spinner],
  providers: [provideIcons({ tablerBrandWhatsapp })],
  template: `
    <div class="container-app py-10">
      @if (cargando()) {
        <app-spinner mensaje="Cargando producto…" />
      } @else if (producto(); as p) {
        <nav class="mb-6 flex items-center gap-1.5 text-sm text-stone-500">
          <a routerLink="/" class="hover:text-clay-700">Inicio</a>
          <lucide-icon name="chevron-right" [size]="14" />
          <a routerLink="/catalogo" class="hover:text-clay-700">Catálogo</a>
          <lucide-icon name="chevron-right" [size]="14" />
          <span class="text-stone-800">{{ p.nombre }}</span>
        </nav>

        <div class="grid gap-10 lg:grid-cols-2">
          <div class="relative overflow-hidden rounded-3xl">
            <img
              [src]="p.imagen_url || '/img/productos/categorias.jpg'"
              [alt]="p.nombre"
              class="aspect-square w-full object-cover"
            />
            @if (p.precio_oferta) {
              <span class="badge absolute top-4 left-4 bg-clay-600 !px-3 !py-1.5 text-white">
                <lucide-icon name="sparkles" [size]="14" />
                En oferta
              </span>
            }
          </div>

          <div>
            @if (p.categoria; as cat) {
              <span class="text-sm font-semibold tracking-wide text-andes-600 uppercase">
                {{ cat.nombre }}
              </span>
            }
            <h1 class="font-display mt-1 text-3xl font-bold text-stone-900 sm:text-4xl">
              {{ p.nombre }}
            </h1>

            <div class="mt-4 flex items-baseline gap-3">
              <span class="text-3xl font-bold text-clay-700">
                {{ precioFinal(p) | currency: 'PEN' : 'S/ ' }}
              </span>
              @if (p.precio_oferta) {
                <span class="text-lg text-stone-400 line-through">
                  {{ p.precio | currency: 'PEN' : 'S/ ' }}
                </span>
              }
            </div>

            @if (p.stock > 0) {
              <p class="mt-2 flex items-center gap-1.5 text-sm text-andes-600">
                <lucide-icon name="circle-check" [size]="15" />
                {{ p.stock }} disponible{{ p.stock === 1 ? '' : 's' }}
              </p>
            } @else {
              <p class="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                <lucide-icon name="circle-x" [size]="15" />
                Agotado por ahora — pídelo personalizado por WhatsApp
              </p>
            }

            <p class="mt-5 leading-relaxed text-stone-600">
              {{ p.descripcion || 'Pieza tejida a mano con lana de calidad.' }}
            </p>

            <!-- Cantidad + acciones -->
            <div class="mt-8 flex flex-wrap items-center gap-4">
              <div class="flex items-center rounded-full border border-stone-300 bg-white">
                <button
                  type="button"
                  class="btn-ghost !p-2.5"
                  (click)="cambiarCantidad(-1)"
                  aria-label="Disminuir cantidad"
                >
                  <lucide-icon name="minus" [size]="16" />
                </button>
                <span class="w-10 text-center font-semibold">{{ cantidad() }}</span>
                <button
                  type="button"
                  class="btn-ghost !p-2.5"
                  (click)="cambiarCantidad(1)"
                  aria-label="Aumentar cantidad"
                >
                  <lucide-icon name="plus" [size]="16" />
                </button>
              </div>

              <button
                type="button"
                class="btn-primary flex-1 !py-3 sm:flex-none sm:!px-8"
                [disabled]="p.stock === 0"
                (click)="agregarAlCarrito()"
              >
                <lucide-icon name="shopping-cart" [size]="18" />
                Agregar al carrito
              </button>
            </div>

            <a
              [href]="urlWhatsapp(p)"
              target="_blank"
              rel="noopener"
              class="btn-outline mt-4 w-full sm:w-auto"
            >
              <ng-icon name="tablerBrandWhatsapp" size="17" />
              Consultar por WhatsApp
            </a>

            <ul class="mt-8 space-y-2.5 border-t border-stone-200 pt-6 text-sm text-stone-600">
              <li class="flex items-center gap-2.5">
                <lucide-icon name="heart" [size]="16" class="text-clay-500" />
                Tejido 100% a mano, cada pieza es única
              </li>
              <li class="flex items-center gap-2.5">
                <lucide-icon name="qr-code" [size]="16" class="text-clay-500" />
                Paga con Yape y sube tu comprobante
              </li>
              <li class="flex items-center gap-2.5">
                <lucide-icon name="truck" [size]="16" class="text-clay-500" />
                Envíos a todo el Perú
              </li>
            </ul>
          </div>
        </div>

        @if (relacionados().length > 0) {
          <section class="mt-16">
            <h2 class="font-display mb-6 text-2xl font-bold text-stone-900">
              También te puede gustar
            </h2>
            <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              @for (rel of relacionados(); track rel.id) {
                <app-producto-card [producto]="rel" />
              }
            </div>
          </section>
        }
      } @else {
        <div class="card mx-auto max-w-md p-10 text-center">
          <p class="font-display text-lg font-semibold text-stone-800">Producto no encontrado</p>
          <a routerLink="/catalogo" class="btn-primary mt-4">Volver al catálogo</a>
        </div>
      }
    </div>
  `,
})
export class ProductoDetalle {
  private readonly productoService = inject(ProductoService);
  private readonly carrito = inject(CarritoService);
  private readonly toast = inject(ToastService);
  private readonly ruta = inject(ActivatedRoute);

  readonly producto = signal<Producto | null>(null);
  readonly relacionados = signal<Producto[]>([]);
  readonly cargando = signal(true);
  readonly cantidad = signal(1);

  constructor() {
    this.ruta.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) void this.cargar(id);
    });
  }

  private async cargar(id: string): Promise<void> {
    this.cargando.set(true);
    this.cantidad.set(1);
    const producto = await this.productoService.obtener(id);
    this.producto.set(producto);
    this.relacionados.set(producto ? await this.productoService.relacionados(producto) : []);
    this.cargando.set(false);
  }

  precioFinal(p: Producto): number {
    return precioVenta(p);
  }

  cambiarCantidad(delta: number): void {
    const maximo = this.producto()?.stock ?? 1;
    this.cantidad.set(Math.min(Math.max(1, this.cantidad() + delta), Math.max(1, maximo)));
  }

  agregarAlCarrito(): void {
    const p = this.producto();
    if (!p) return;
    if (this.carrito.agregar(p, this.cantidad())) {
      this.toast.exito(`"${p.nombre}" se agregó al carrito`);
    } else {
      this.toast.error('No hay suficiente stock disponible');
    }
  }

  urlWhatsapp(p: Producto): string {
    const texto = encodeURIComponent(`Hola, me interesa "${p.nombre}" que vi en la tienda`);
    return `https://wa.me/${environment.contacto.whatsapp}?text=${texto}`;
  }
}
