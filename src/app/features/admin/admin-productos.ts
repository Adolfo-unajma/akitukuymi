import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Categoria, Producto } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ConfirmacionService } from '../../core/services/confirmacion.service';
import { ProductoService } from '../../core/services/producto.service';
import { ToastService } from '../../core/services/toast.service';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-admin-productos',
  imports: [CurrencyPipe, ReactiveFormsModule, LucideAngularModule, Spinner],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-stone-900">Productos</h1>
      <button type="button" class="btn-primary" (click)="nuevo()">
        <lucide-icon name="plus" [size]="16" />
        Nuevo producto
      </button>
    </div>

    @if (cargando()) {
      <app-spinner mensaje="Cargando productos…" />
    } @else {
      <div class="card overflow-x-auto">
        <table class="w-full min-w-[42rem] text-sm">
          <thead class="bg-stone-50 text-left text-xs text-stone-500 uppercase">
            <tr>
              <th class="px-4 py-3">Producto</th>
              <th class="px-4 py-3">Categoría</th>
              <th class="px-4 py-3">Precio</th>
              <th class="px-4 py-3">Stock</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            @for (producto of productos(); track producto.id) {
              <tr class="hover:bg-stone-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      [src]="producto.imagen_url || '/img/productos/categorias.jpg'"
                      [alt]="producto.nombre"
                      class="h-11 w-11 rounded-lg object-cover"
                    />
                    <span class="font-medium">
                      {{ producto.nombre }}
                      @if (producto.destacado) {
                        <lucide-icon name="star" [size]="13" class="ml-1 inline text-amber-500" />
                      }
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-stone-500">{{ producto.categoria?.nombre ?? '—' }}</td>
                <td class="px-4 py-3">
                  @if (producto.precio_oferta) {
                    <span class="font-semibold text-clay-700">
                      {{ producto.precio_oferta | currency: 'PEN' : 'S/ ' }}
                    </span>
                    <span class="ml-1 text-xs text-stone-400 line-through">
                      {{ producto.precio | currency: 'PEN' : 'S/ ' }}
                    </span>
                  } @else {
                    {{ producto.precio | currency: 'PEN' : 'S/ ' }}
                  }
                </td>
                <td class="px-4 py-3">
                  <span
                    class="badge"
                    [class]="
                      producto.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : producto.stock <= 3
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                    "
                  >
                    {{ producto.stock }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="badge"
                    [class]="producto.activo ? 'bg-andes-100 text-andes-700' : 'bg-stone-200 text-stone-500'"
                  >
                    {{ producto.activo ? 'Activo' : 'Oculto' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <button
                      type="button"
                      class="cursor-pointer p-1.5 text-stone-400 hover:text-clay-700"
                      (click)="editar(producto)"
                      aria-label="Editar"
                    >
                      <lucide-icon name="pencil" [size]="16" />
                    </button>
                    <button
                      type="button"
                      class="cursor-pointer p-1.5 text-stone-400 hover:text-red-600"
                      (click)="eliminar(producto)"
                      aria-label="Eliminar"
                    >
                      <lucide-icon name="trash-2" [size]="16" />
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-10 text-center text-stone-400">
                  No hay productos, crea el primero.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- ══════ Modal crear/editar ══════ -->
    @if (editando()) {
      <div
        class="fixed inset-0 z-[75] flex items-center justify-center overflow-y-auto bg-stone-900/50 p-4 backdrop-blur-sm"
        (click)="cerrarModal()"
      >
        <div
          class="card my-8 w-full max-w-xl p-6"
          (click)="$event.stopPropagation()"
        >
          <h2 class="font-display mb-5 text-lg font-bold">
            {{ formulario.value.id ? 'Editar producto' : 'Nuevo producto' }}
          </h2>

          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="label">Nombre</label>
              <input formControlName="nombre" class="input" placeholder="Chompa de alpaca…" />
            </div>

            <div class="sm:col-span-2">
              <label class="label">Descripción</label>
              <textarea
                formControlName="descripcion"
                class="input min-h-20"
                placeholder="Describe el producto…"
              ></textarea>
            </div>

            <div>
              <label class="label">Categoría</label>
              <select formControlName="categoria_id" class="input">
                <option value="" disabled>Elige una categoría</option>
                @for (cat of categorias(); track cat.id) {
                  <option [value]="cat.id">{{ cat.nombre }}</option>
                }
              </select>
            </div>
            <div>
              <label class="label">Stock</label>
              <input type="number" formControlName="stock" class="input" min="0" />
            </div>

            <div>
              <label class="label">Precio (S/)</label>
              <input type="number" formControlName="precio" class="input" min="0" step="0.5" />
            </div>
            <div>
              <label class="label">
                Precio oferta <span class="text-stone-400">(opcional)</span>
              </label>
              <input
                type="number"
                formControlName="precio_oferta"
                class="input"
                min="0"
                step="0.5"
              />
            </div>

            <div class="sm:col-span-2">
              <label class="label">Imagen</label>
              <div class="flex items-center gap-4">
                @if (imagenActual()) {
                  <img
                    [src]="imagenActual()"
                    alt="Vista previa"
                    class="h-20 w-20 rounded-xl border border-stone-200 object-cover"
                  />
                }
                <label class="btn-outline cursor-pointer">
                  <lucide-icon name="image-plus" [size]="16" />
                  {{ imagenActual() ? 'Cambiar imagen' : 'Subir imagen' }}
                  <input type="file" accept="image/*" class="hidden" (change)="subirImagen($event)" />
                </label>
              </div>
            </div>

            <label class="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" formControlName="destacado" class="h-4 w-4 accent-clay-600" />
              Producto destacado (aparece en el inicio)
            </label>
            <label class="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" formControlName="activo" class="h-4 w-4 accent-clay-600" />
              Visible en la tienda
            </label>

            <div class="mt-2 flex justify-end gap-3 sm:col-span-2">
              <button type="button" class="btn-outline" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn-primary" [disabled]="guardando()">
                @if (guardando()) {
                  <lucide-icon name="loader-circle" [size]="16" class="animate-spin" />
                }
                Guardar producto
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AdminProductos {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly toast = inject(ToastService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly fb = inject(FormBuilder);

  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly editando = signal(false);
  readonly guardando = signal(false);
  readonly imagenActual = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    categoria_id: ['', Validators.required],
    precio: [0, [Validators.required, Validators.min(0.5)]],
    precio_oferta: [null as number | null],
    stock: [0, [Validators.required, Validators.min(0)]],
    destacado: [false],
    activo: [true],
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    const [productos, categorias] = await Promise.all([
      this.productoService.listarTodos(),
      this.categoriaService.listarTodas(),
    ]);
    this.productos.set(productos);
    this.categorias.set(categorias);
    this.cargando.set(false);
  }

  nuevo(): void {
    this.formulario.reset({
      id: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      precio: 0,
      precio_oferta: null,
      stock: 0,
      destacado: false,
      activo: true,
    });
    this.imagenActual.set(null);
    this.editando.set(true);
  }

  editar(producto: Producto): void {
    this.formulario.reset({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      categoria_id: producto.categoria_id,
      precio: producto.precio,
      precio_oferta: producto.precio_oferta ?? null,
      stock: producto.stock,
      destacado: producto.destacado,
      activo: producto.activo,
    });
    this.imagenActual.set(producto.imagen_url ?? null);
    this.editando.set(true);
  }

  cerrarModal(): void {
    this.editando.set(false);
  }

  async subirImagen(evento: Event): Promise<void> {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    try {
      const url = await this.productoService.subirImagen(archivo);
      this.imagenActual.set(url);
      this.toast.exito('Imagen lista');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen');
    }
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toast.error('Completa el nombre, la categoría y el precio');
      return;
    }
    this.guardando.set(true);
    try {
      const valores = this.formulario.getRawValue();
      await this.productoService.guardar({
        ...(valores.id ? { id: valores.id } : {}),
        nombre: valores.nombre,
        descripcion: valores.descripcion,
        categoria_id: valores.categoria_id,
        precio: valores.precio,
        precio_oferta: valores.precio_oferta,
        stock: valores.stock,
        destacado: valores.destacado,
        activo: valores.activo,
        imagen_url: this.imagenActual() ?? undefined,
      });
      this.toast.exito('Producto guardado');
      this.editando.set(false);
      await this.cargar();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar(producto: Producto): Promise<void> {
    const ok = await this.confirmacion.pedir({
      titulo: 'Eliminar producto',
      mensaje: `¿Eliminar "${producto.nombre}" definitivamente? Si solo quieres ocultarlo, edítalo y desmarca "Visible".`,
      textoConfirmar: 'Eliminar',
      peligroso: true,
    });
    if (!ok) return;
    try {
      await this.productoService.eliminar(producto.id);
      this.toast.exito('Producto eliminado');
      await this.cargar();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo eliminar');
    }
  }
}
