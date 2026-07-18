import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Categoria, Producto, precioVenta } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProductoService } from '../../core/services/producto.service';
import { ProductoCard } from '../../shared/components/producto-card';
import { ProductoSkeleton } from '../../shared/components/producto-skeleton';

type Orden = 'recientes' | 'precio_asc' | 'precio_desc';

@Component({
  selector: 'app-catalogo',
  imports: [FormsModule, LucideAngularModule, ProductoCard, ProductoSkeleton],
  template: `
    <div class="container-app py-10">
      <header class="mb-8">
        <h1 class="font-display text-3xl font-bold text-stone-900 sm:text-4xl">Catálogo</h1>
        <p class="mt-1 text-stone-600">
          Todos nuestros tejidos artesanales, hechos a mano pieza por pieza.
        </p>
      </header>

      <div class="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <!-- ─────── Filtros ─────── -->
        <aside class="space-y-6">
          <div>
            <label class="label" for="buscar">Buscar</label>
            <label
              class="input flex items-center gap-2.5 focus-within:border-clay-500 focus-within:ring-2 focus-within:ring-clay-200"
            >
              <lucide-icon name="search" [size]="17" class="shrink-0 text-stone-400" />
              <input
                id="buscar"
                type="search"
                class="w-full bg-transparent outline-none placeholder:text-stone-400"
                placeholder="¿Qué buscas?"
                [ngModel]="buscar()"
                (ngModelChange)="buscar.set($event); recargar()"
              />
            </label>
          </div>

          <div>
            <p class="label">Categorías</p>
            <div class="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              <button
                type="button"
                class="filtro-cat"
                [class.activo]="!categoriaId()"
                (click)="elegirCategoria(null)"
              >
                Todas
              </button>
              @for (cat of categorias(); track cat.id) {
                <button
                  type="button"
                  class="filtro-cat"
                  [class.activo]="categoriaId() === cat.id"
                  (click)="elegirCategoria(cat.id)"
                >
                  {{ cat.nombre }}
                </button>
              }
            </div>
          </div>

          <label class="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700">
            <input
              type="checkbox"
              class="h-4 w-4 accent-clay-600"
              [ngModel]="soloOfertas()"
              (ngModelChange)="soloOfertas.set($event); recargar()"
            />
            Solo ofertas
          </label>
        </aside>

        <!-- ─────── Resultados ─────── -->
        <section>
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-stone-500">
              {{ productos().length }} producto{{ productos().length === 1 ? '' : 's' }}
            </p>
            <select
              class="input w-auto !py-2 text-sm"
              [ngModel]="orden()"
              (ngModelChange)="orden.set($event)"
              aria-label="Ordenar productos"
            >
              <option value="recientes">Más recientes</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
            </select>
          </div>

          @if (cargando()) {
            <div class="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
              @for (i of [1, 2, 3, 4, 5, 6]; track i) {
                <app-producto-skeleton />
              }
            </div>
          } @else if (ordenados().length === 0) {
            <div class="card flex flex-col items-center gap-3 p-12 text-center">
              <lucide-icon name="search" [size]="40" class="text-stone-300" />
              <p class="font-display text-lg font-semibold text-stone-700">
                No encontramos productos
              </p>
              <p class="text-sm text-stone-500">Prueba con otra búsqueda o quita los filtros.</p>
              <button type="button" class="btn-outline mt-2" (click)="limpiarFiltros()">
                Limpiar filtros
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
              @for (producto of ordenados(); track producto.id) {
                <app-producto-card [producto]="producto" />
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: `
    .filtro-cat {
      cursor: pointer;
      border-radius: 9999px;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      text-align: left;
      color: var(--color-stone-600);
      transition: all 0.15s;
    }
    .filtro-cat:hover {
      background: var(--color-stone-100);
    }
    .filtro-cat.activo {
      background: var(--color-clay-600);
      color: white;
      font-weight: 600;
    }
  `,
})
export class Catalogo {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);

  readonly buscar = signal('');
  readonly categoriaId = signal<string | null>(null);
  readonly soloOfertas = signal(false);
  readonly orden = signal<Orden>('recientes');

  constructor() {
    void this.categoriaService.listarActivas().then((c) => this.categorias.set(c));
    this.ruta.queryParamMap.subscribe((params) => {
      this.categoriaId.set(params.get('categoria'));
      this.soloOfertas.set(params.get('ofertas') === '1');
      void this.recargar();
    });
  }

  ordenados(): Producto[] {
    const lista = [...this.productos()];
    switch (this.orden()) {
      case 'precio_asc':
        return lista.sort((a, b) => precioVenta(a) - precioVenta(b));
      case 'precio_desc':
        return lista.sort((a, b) => precioVenta(b) - precioVenta(a));
      default:
        return lista;
    }
  }

  elegirCategoria(id: string | null): void {
    void this.router.navigate([], {
      relativeTo: this.ruta,
      queryParams: { categoria: id },
      queryParamsHandling: 'merge',
    });
  }

  limpiarFiltros(): void {
    this.buscar.set('');
    void this.router.navigate([], { relativeTo: this.ruta, queryParams: {} });
  }

  async recargar(): Promise<void> {
    this.cargando.set(true);
    const lista = await this.productoService.listarActivos({
      categoriaId: this.categoriaId() ?? undefined,
      buscar: this.buscar() || undefined,
      soloOfertas: this.soloOfertas(),
    });
    this.productos.set(lista);
    this.cargando.set(false);
  }
}
