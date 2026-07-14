import { Component, PendingTasks, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrandWhatsapp } from '@ng-icons/tabler-icons';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { Categoria, Lana, Producto } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { LanaService } from '../../core/services/lana.service';
import { ProductoService } from '../../core/services/producto.service';
import { ProductoCard } from '../../shared/components/producto-card';

@Component({
  selector: 'app-home',
  imports: [CurrencyPipe, RouterLink, LucideAngularModule, NgIcon, ProductoCard],
  providers: [provideIcons({ tablerBrandWhatsapp })],
  template: `
    <!-- ═══════════════ HERO ═══════════════ -->
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-clay-100 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-andes-100 blur-3xl"
      ></div>

      <div class="container-app relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p
            class="badge mb-5 border border-clay-200 bg-clay-50 !px-3 !py-1.5 text-clay-700"
          >
            <lucide-icon name="heart" [size]="13" />
            Hecho a mano en Perú
          </p>
          <h1
            class="font-display text-4xl leading-tight font-bold text-stone-900 sm:text-5xl lg:text-6xl"
          >
            Tejidos con historia,<br />
            <span class="text-clay-600">hechos con amor</span>
          </h1>
          <p class="mt-5 max-w-lg text-lg text-stone-600">
            Chompas, gorros, amigurumis, mantas y ramos que nunca se marchitan.
            Cada pieza es única, tejida a mano con lana de calidad.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/catalogo" class="btn-primary !px-7 !py-3 !text-base">
              Ver catálogo
              <lucide-icon name="arrow-right" [size]="18" />
            </a>
            <a
              [href]="urlWhatsappPedido"
              target="_blank"
              rel="noopener"
              class="btn-outline !px-7 !py-3 !text-base"
            >
              <ng-icon name="tablerBrandWhatsapp" size="18" />
              Pedido personalizado
            </a>
          </div>

          <ul class="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone-600">
            <li class="flex items-center gap-2">
              <lucide-icon name="qr-code" [size]="17" class="text-andes-600" />
              Paga fácil con Yape
            </li>
            <li class="flex items-center gap-2">
              <lucide-icon name="truck" [size]="17" class="text-andes-600" />
              Envíos a todo el Perú
            </li>
            <li class="flex items-center gap-2">
              <lucide-icon name="shield-check" [size]="17" class="text-andes-600" />
              Compra protegida
            </li>
          </ul>
        </div>

        <div class="relative mx-auto w-full max-w-md lg:max-w-none">
          <img
            src="/img/ofertas/ramos.jpg"
            alt="Ramo de flores tejidas a mano"
            fetchpriority="high"
            class="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
          />
          <img
            src="/img/productos/amigurumis.jpeg"
            alt="Amigurumis tejidos a crochet"
            loading="lazy"
            class="absolute -bottom-8 -left-6 hidden w-40 rotate-[-6deg] rounded-2xl border-4 border-cream-50 object-cover shadow-xl sm:block"
          />
          <div
            class="card absolute top-6 -right-3 flex items-center gap-2.5 !rounded-full py-2 pr-5 pl-2.5 shadow-lg sm:-right-6"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-full bg-clay-600 text-white"
            >
              <lucide-icon name="sparkles" [size]="17" />
            </span>
            <div class="text-xs">
              <p class="font-bold text-stone-800">100% artesanal</p>
              <p class="text-stone-500">Piezas únicas</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════ CATEGORÍAS ═══════════════ -->
    <section class="container-app py-14">
      <header class="mb-8 flex items-end justify-between">
        <div>
          <p class="text-sm font-semibold tracking-wide text-andes-600 uppercase">Explora</p>
          <h2 class="font-display text-3xl font-bold text-stone-900">Nuestras categorías</h2>
        </div>
        <a routerLink="/catalogo" class="btn-ghost hidden sm:inline-flex">
          Ver todo <lucide-icon name="arrow-right" [size]="16" />
        </a>
      </header>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        @for (cat of categorias(); track cat.id) {
          <a
            [routerLink]="['/catalogo']"
            [queryParams]="{ categoria: cat.id }"
            class="group relative block overflow-hidden rounded-2xl"
          >
            <img
              [src]="cat.imagen_url || '/img/productos/categorias.jpg'"
              [alt]="cat.nombre"
              loading="lazy"
              class="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/10 to-transparent"
            ></div>
            <p class="absolute bottom-3 left-3 font-semibold text-white">{{ cat.nombre }}</p>
          </a>
        } @empty {
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="aspect-[4/5] animate-pulse rounded-2xl bg-stone-200"></div>
          }
        }
      </div>
    </section>

    <!-- ═══════════════ DESTACADOS ═══════════════ -->
    <section class="bg-cream-100 py-14">
      <div class="container-app">
        <header class="mb-8 flex items-end justify-between">
          <div>
            <p class="text-sm font-semibold tracking-wide text-andes-600 uppercase">
              Los favoritos
            </p>
            <h2 class="font-display text-3xl font-bold text-stone-900">Productos destacados</h2>
          </div>
          <a routerLink="/catalogo" class="btn-ghost hidden sm:inline-flex">
            Ver catálogo <lucide-icon name="arrow-right" [size]="16" />
          </a>
        </header>

        <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          @for (producto of destacados(); track producto.id) {
            <app-producto-card [producto]="producto" />
          } @empty {
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="aspect-[3/4] animate-pulse rounded-2xl bg-stone-200"></div>
            }
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════ CÓMO COMPRAR ═══════════════ -->
    <section id="como-comprar" class="container-app py-16">
      <header class="mx-auto mb-10 max-w-xl text-center">
        <p class="text-sm font-semibold tracking-wide text-andes-600 uppercase">Muy fácil</p>
        <h2 class="font-display text-3xl font-bold text-stone-900">¿Cómo comprar?</h2>
        <p class="mt-2 text-stone-600">
          En 4 pasos simples tienes tu tejido favorito en la puerta de tu casa.
        </p>
      </header>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        @for (paso of pasos; track paso.titulo; let i = $index) {
          <div class="card relative p-6 text-center">
            <span
              class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-clay-600 px-3 py-0.5 text-xs font-bold text-white"
            >
              Paso {{ i + 1 }}
            </span>
            <span
              class="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-clay-50 text-clay-600"
            >
              <lucide-icon [name]="paso.icono" [size]="26" />
            </span>
            <h3 class="font-display mt-4 font-bold text-stone-900">{{ paso.titulo }}</h3>
            <p class="mt-1.5 text-sm text-stone-600">{{ paso.detalle }}</p>
          </div>
        }
      </div>
    </section>

    <!-- ═══════════════ LANAS ═══════════════ -->
    <section id="lanas" class="bg-andes-700 py-16 text-white">
      <div class="container-app grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p class="text-sm font-semibold tracking-wide text-andes-100 uppercase">
            También vendemos
          </p>
          <h2 class="font-display text-3xl font-bold">Lanas e hilos por unidad o paquete</h2>
          <p class="mt-3 max-w-md text-andes-100/90">
            ¿Tejes tus propias creaciones? Tenemos lanas de calidad al mejor precio.
            Pide por WhatsApp y te lo enviamos.
          </p>
          <a
            [href]="urlWhatsappLanas"
            target="_blank"
            rel="noopener"
            class="btn-primary mt-6 !bg-white !text-andes-700 hover:!bg-cream-100"
          >
            <ng-icon name="tablerBrandWhatsapp" size="17" />
            Pedir lanas por WhatsApp
          </a>
        </div>

        <div class="card overflow-hidden !border-0 text-stone-800">
          <table class="w-full text-sm">
            <thead class="bg-cream-100 text-left text-xs text-stone-500 uppercase">
              <tr>
                <th class="px-4 py-3">Lana</th>
                <th class="px-4 py-3">Color</th>
                <th class="px-4 py-3 text-right">Unidad</th>
                <th class="px-4 py-3 text-right">Paquete</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 bg-white">
              @for (lana of lanas(); track lana.id) {
                <tr>
                  <td class="px-4 py-3 font-medium">{{ lana.nombre }}</td>
                  <td class="px-4 py-3 text-stone-500">{{ lana.color }}</td>
                  <td class="px-4 py-3 text-right">
                    {{ lana.precio_unidad | currency: 'PEN' : 'S/ ' }}
                  </td>
                  <td class="px-4 py-3 text-right font-semibold text-clay-700">
                    {{ lana.precio_paquete | currency: 'PEN' : 'S/ ' }}
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-4 py-6 text-center text-stone-400">
                    Cargando precios…
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ═══════════════ NOSOTROS / CTA ═══════════════ -->
    <section id="nosotros" class="container-app py-16">
      <div
        class="card grid items-center gap-8 overflow-hidden !rounded-3xl lg:grid-cols-2"
      >
        <img
          src="/img/productos/mantas.jpeg"
          alt="Mantas tejidas a mano"
          loading="lazy"
          class="h-full max-h-80 w-full object-cover lg:max-h-none"
        />
        <div class="p-8 lg:p-10">
          <p class="text-sm font-semibold tracking-wide text-andes-600 uppercase">
            Tienda artesanal
          </p>
          <h2 class="font-display mt-1 text-3xl font-bold text-stone-900">
            Tradición que se teje punto a punto
          </h2>
          <p class="mt-4 leading-relaxed text-stone-600">
            Akitukuymi nace de una tienda artesanal familiar peruana. Cada chompa, gorro o amigurumi
            pasa por manos expertas que convierten la lana en piezas llenas de cariño.
            Compra directo de la artesana, sin intermediarios.
          </p>
          <div class="mt-6 flex flex-wrap gap-3">
            <a routerLink="/catalogo" class="btn-primary">
              <lucide-icon name="shopping-bag" [size]="17" />
              Comprar ahora
            </a>
            <a
              [href]="urlWhatsappConsulta"
              target="_blank"
              rel="noopener"
              class="btn-outline"
            >
              Hacer una consulta
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Home {
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);
  private readonly lanaService = inject(LanaService);

  readonly categorias = signal<Categoria[]>([]);
  readonly destacados = signal<Producto[]>([]);
  readonly lanas = signal<Lana[]>([]);

  private readonly whatsapp = environment.contacto.whatsapp;
  readonly urlWhatsappPedido = `https://wa.me/${this.whatsapp}?text=Hola,%20quiero%20hacer%20un%20pedido%20personalizado`;
  readonly urlWhatsappLanas = `https://wa.me/${this.whatsapp}?text=Hola,%20quiero%20pedir%20lanas`;
  readonly urlWhatsappConsulta = `https://wa.me/${this.whatsapp}?text=Hola,%20tengo%20una%20consulta`;

  readonly pasos = [
    {
      icono: 'shopping-cart',
      titulo: 'Elige tus tejidos',
      detalle: 'Explora el catálogo y agrega tus favoritos al carrito.',
    },
    {
      icono: 'qr-code',
      titulo: 'Paga con Yape',
      detalle: 'Escanea nuestro QR y paga el total de tu pedido.',
    },
    {
      icono: 'camera',
      titulo: 'Sube tu comprobante',
      detalle: 'Adjunta la captura del pago para verificarlo.',
    },
    {
      icono: 'truck',
      titulo: 'Recíbelo en casa',
      detalle: 'Preparamos tu pedido y te lo enviamos con cariño.',
    },
  ];

  private readonly tareas = inject(PendingTasks);

  constructor() {
    // Registrado como tarea pendiente para que el SSR espere los datos
    const listo = this.tareas.add();
    void this.cargar().finally(() => listo());
  }

  private async cargar(): Promise<void> {
    const [categorias, destacados, lanas] = await Promise.all([
      this.categoriaService.listarActivas(),
      this.productoService.destacados(),
      this.lanaService.listarActivas(),
    ]);
    this.categorias.set(categorias);
    this.destacados.set(destacados);
    this.lanas.set(lanas);
  }
}
