import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Lana } from '../../core/models';
import { ConfirmacionService } from '../../core/services/confirmacion.service';
import { LanaService } from '../../core/services/lana.service';
import { ToastService } from '../../core/services/toast.service';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-admin-lanas',
  imports: [CurrencyPipe, ReactiveFormsModule, LucideAngularModule, Spinner],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-stone-900">Lanas e hilos</h1>
      <button type="button" class="btn-primary" (click)="nueva()">
        <lucide-icon name="plus" [size]="16" />
        Nueva lana
      </button>
    </div>

    @if (cargando()) {
      <app-spinner mensaje="Cargando lanas…" />
    } @else {
      <div class="card overflow-x-auto">
        <table class="w-full min-w-[38rem] text-sm">
          <thead class="bg-stone-50 text-left text-xs text-stone-500 uppercase">
            <tr>
              <th class="px-4 py-3">Lana</th>
              <th class="px-4 py-3">Color</th>
              <th class="px-4 py-3 text-right">Precio unidad</th>
              <th class="px-4 py-3 text-right">Precio paquete</th>
              <th class="px-4 py-3 text-right">Stock</th>
              <th class="px-4 py-3">Estado</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            @for (lana of lanas(); track lana.id) {
              <tr class="hover:bg-stone-50">
                <td class="px-4 py-3 font-medium">{{ lana.nombre }}</td>
                <td class="px-4 py-3 text-stone-500">{{ lana.color ?? '—' }}</td>
                <td class="px-4 py-3 text-right">
                  {{ lana.precio_unidad | currency: 'PEN' : 'S/ ' }}
                </td>
                <td class="px-4 py-3 text-right font-semibold text-clay-700">
                  {{ lana.precio_paquete | currency: 'PEN' : 'S/ ' }}
                  <span class="block text-xs font-normal text-stone-400">
                    ({{ lana.unidades_por_paquete ?? 10 }} uds.)
                  </span>
                </td>
                <td class="px-4 py-3 text-right">{{ lana.stock ?? 0 }}</td>
                <td class="px-4 py-3">
                  <span
                    class="badge"
                    [class]="lana.activo ? 'bg-andes-100 text-andes-700' : 'bg-stone-200 text-stone-500'"
                  >
                    {{ lana.activo ? 'Activa' : 'Oculta' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-1">
                    <button
                      type="button"
                      class="cursor-pointer p-1.5 text-stone-400 hover:text-clay-700"
                      (click)="editar(lana)"
                      aria-label="Editar"
                    >
                      <lucide-icon name="pencil" [size]="16" />
                    </button>
                    <button
                      type="button"
                      class="cursor-pointer p-1.5 text-stone-400 hover:text-red-600"
                      (click)="eliminar(lana)"
                      aria-label="Eliminar"
                    >
                      <lucide-icon name="trash-2" [size]="16" />
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="px-4 py-10 text-center text-stone-400">
                  No hay lanas registradas.
                </td>
              </tr>
            }
          </tbody>
        </table>
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
            {{ formulario.value.id ? 'Editar lana' : 'Nueva lana' }}
          </h2>
          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="label">Nombre</label>
              <input formControlName="nombre" class="input" placeholder="Lana acrílica premium" />
            </div>
            <div>
              <label class="label">Color</label>
              <input formControlName="color" class="input" placeholder="Rojo" />
            </div>
            <div>
              <label class="label">Stock (unidades)</label>
              <input type="number" formControlName="stock" class="input" min="0" />
            </div>
            <div>
              <label class="label">Precio por unidad (S/)</label>
              <input type="number" formControlName="precio_unidad" class="input" min="0" step="0.1" />
            </div>
            <div>
              <label class="label">Precio por paquete (S/)</label>
              <input
                type="number"
                formControlName="precio_paquete"
                class="input"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label class="label">Unidades por paquete</label>
              <input
                type="number"
                formControlName="unidades_por_paquete"
                class="input"
                min="1"
              />
            </div>
            <label class="flex cursor-pointer items-center gap-2.5 self-end pb-2 text-sm">
              <input type="checkbox" formControlName="activo" class="h-4 w-4 accent-clay-600" />
              Visible en la tienda
            </label>
            <div class="flex justify-end gap-3 pt-2 sm:col-span-2">
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
export class AdminLanas {
  private readonly lanaService = inject(LanaService);
  private readonly toast = inject(ToastService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly fb = inject(FormBuilder);

  readonly lanas = signal<Lana[]>([]);
  readonly cargando = signal(true);
  readonly editando = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    id: [''],
    nombre: ['', Validators.required],
    color: [''],
    precio_unidad: [0, [Validators.required, Validators.min(0.1)]],
    precio_paquete: [0, [Validators.required, Validators.min(0.1)]],
    unidades_por_paquete: [10, Validators.min(1)],
    stock: [0, Validators.min(0)],
    activo: [true],
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.lanas.set(await this.lanaService.listarTodas());
    this.cargando.set(false);
  }

  nueva(): void {
    this.formulario.reset({
      id: '',
      nombre: '',
      color: '',
      precio_unidad: 0,
      precio_paquete: 0,
      unidades_por_paquete: 10,
      stock: 0,
      activo: true,
    });
    this.editando.set(true);
  }

  editar(lana: Lana): void {
    this.formulario.reset({
      id: lana.id,
      nombre: lana.nombre,
      color: lana.color ?? '',
      precio_unidad: lana.precio_unidad,
      precio_paquete: lana.precio_paquete,
      unidades_por_paquete: lana.unidades_por_paquete ?? 10,
      stock: lana.stock ?? 0,
      activo: lana.activo,
    });
    this.editando.set(true);
  }

  async guardar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.toast.error('Completa el nombre y los precios');
      return;
    }
    const valores = this.formulario.getRawValue();
    try {
      await this.lanaService.guardar({
        ...(valores.id ? { id: valores.id } : {}),
        nombre: valores.nombre,
        color: valores.color,
        precio_unidad: valores.precio_unidad,
        precio_paquete: valores.precio_paquete,
        unidades_por_paquete: valores.unidades_por_paquete,
        stock: valores.stock,
        activo: valores.activo,
      });
      this.toast.exito('Lana guardada');
      this.editando.set(false);
      await this.cargar();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    }
  }

  async eliminar(lana: Lana): Promise<void> {
    const ok = await this.confirmacion.pedir({
      titulo: 'Eliminar lana',
      mensaje: `¿Eliminar "${lana.nombre}${lana.color ? ' - ' + lana.color : ''}"?`,
      textoConfirmar: 'Eliminar',
      peligroso: true,
    });
    if (!ok) return;
    try {
      await this.lanaService.eliminar(lana.id);
      this.toast.exito('Lana eliminada');
      await this.cargar();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo eliminar');
    }
  }
}
