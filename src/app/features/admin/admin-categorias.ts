import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Categoria } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ConfirmacionService } from '../../core/services/confirmacion.service';
import { ProductoService } from '../../core/services/producto.service';
import { ToastService } from '../../core/services/toast.service';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-admin-categorias',
  imports: [ReactiveFormsModule, LucideAngularModule, Spinner],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-stone-900">Categorías</h1>
      <button type="button" class="btn-primary" (click)="nueva()">
        <lucide-icon name="plus" [size]="16" />
        Nueva categoría
      </button>
    </div>

    @if (cargando()) {
      <app-spinner mensaje="Cargando categorías…" />
    } @else {
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        @for (cat of categorias(); track cat.id) {
          <div class="card overflow-hidden">
            <img
              [src]="cat.imagen_url || '/img/productos/categorias.jpg'"
              [alt]="cat.nombre"
              class="h-32 w-full object-cover"
            />
            <div class="p-4">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h2 class="font-display font-bold text-stone-900">{{ cat.nombre }}</h2>
                  <p class="text-xs text-stone-500">
                    {{ cat.productos_count ?? 0 }} producto{{
                      (cat.productos_count ?? 0) === 1 ? '' : 's'
                    }}
                  </p>
                </div>
                <span
                  class="badge"
                  [class]="cat.activo ? 'bg-andes-100 text-andes-700' : 'bg-stone-200 text-stone-500'"
                >
                  {{ cat.activo ? 'Activa' : 'Oculta' }}
                </span>
              </div>
              @if (cat.descripcion) {
                <p class="mt-2 line-clamp-2 text-sm text-stone-600">{{ cat.descripcion }}</p>
              }
              <div class="mt-3 flex justify-end gap-1">
                <button
                  type="button"
                  class="cursor-pointer p-1.5 text-stone-400 hover:text-clay-700"
                  (click)="editar(cat)"
                  aria-label="Editar"
                >
                  <lucide-icon name="pencil" [size]="16" />
                </button>
                <button
                  type="button"
                  class="cursor-pointer p-1.5 text-stone-400 hover:text-red-600"
                  (click)="eliminar(cat)"
                  aria-label="Eliminar"
                >
                  <lucide-icon name="trash-2" [size]="16" />
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <p class="col-span-full py-10 text-center text-stone-400">
            No hay categorías, crea la primera.
          </p>
        }
      </div>
    }

    <!-- Modal -->
    @if (editando()) {
      <div
        class="fixed inset-0 z-[75] flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
        (click)="editando.set(false)"
      >
        <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
          <h2 class="font-display mb-5 text-lg font-bold">
            {{ formulario.value.id ? 'Editar categoría' : 'Nueva categoría' }}
          </h2>
          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="space-y-4">
            <div>
              <label class="label">Nombre</label>
              <input formControlName="nombre" class="input" placeholder="Gorros" />
            </div>
            <div>
              <label class="label">Descripción</label>
              <textarea
                formControlName="descripcion"
                class="input min-h-16"
                placeholder="Breve descripción…"
              ></textarea>
            </div>
            <div>
              <label class="label">Imagen</label>
              <div class="flex items-center gap-4">
                @if (imagenActual()) {
                  <img
                    [src]="imagenActual()"
                    alt="Vista previa"
                    class="h-16 w-16 rounded-xl border border-stone-200 object-cover"
                  />
                }
                <label class="btn-outline cursor-pointer !py-2">
                  <lucide-icon name="image-plus" [size]="15" />
                  {{ imagenActual() ? 'Cambiar' : 'Subir' }}
                  <input type="file" accept="image/*" class="hidden" (change)="subirImagen($event)" />
                </label>
              </div>
            </div>
            <label class="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" formControlName="activo" class="h-4 w-4 accent-clay-600" />
              Visible en la tienda
            </label>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" class="btn-outline" (click)="editando.set(false)">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class AdminCategorias {
  private readonly categoriaService = inject(CategoriaService);
  private readonly productoService = inject(ProductoService);
  private readonly toast = inject(ToastService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly fb = inject(FormBuilder);

  readonly categorias = signal<Categoria[]>([]);
  readonly cargando = signal(true);
  readonly editando = signal(false);
  readonly imagenActual = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    id: [''],
    nombre: ['', Validators.required],
    descripcion: [''],
    activo: [true],
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.categorias.set(await this.categoriaService.listarTodas());
    this.cargando.set(false);
  }

  nueva(): void {
    this.formulario.reset({ id: '', nombre: '', descripcion: '', activo: true });
    this.imagenActual.set(null);
    this.editando.set(true);
  }

  editar(cat: Categoria): void {
    this.formulario.reset({
      id: cat.id,
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? '',
      activo: cat.activo,
    });
    this.imagenActual.set(cat.imagen_url ?? null);
    this.editando.set(true);
  }

  async subirImagen(evento: Event): Promise<void> {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    try {
      this.imagenActual.set(await this.productoService.subirImagen(archivo));
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo subir la imagen');
    }
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    try {
      await this.categoriaService.guardar({
        ...(valores.id ? { id: valores.id } : {}),
        nombre: valores.nombre,
        descripcion: valores.descripcion,
        activo: valores.activo,
        imagen_url: this.imagenActual() ?? undefined,
      });
      this.toast.exito('Categoría guardada');
      this.editando.set(false);
      await this.cargar();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    }
  }

  async eliminar(cat: Categoria): Promise<void> {
    const ok = await this.confirmacion.pedir({
      titulo: 'Eliminar categoría',
      mensaje: `¿Eliminar "${cat.nombre}"? Los productos de esta categoría quedarían sin categoría.`,
      textoConfirmar: 'Eliminar',
      peligroso: true,
    });
    if (!ok) return;
    try {
      await this.categoriaService.eliminar(cat.id);
      this.toast.exito('Categoría eliminada');
      await this.cargar();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo eliminar');
    }
  }
}
