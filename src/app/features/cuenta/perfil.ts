import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DireccionEnvio } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmacionService } from '../../core/services/confirmacion.service';
import { DireccionService } from '../../core/services/direccion.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="container-app max-w-4xl py-10">
      <h1 class="font-display mb-8 text-3xl font-bold text-stone-900">Mi perfil</h1>

      <div class="grid items-start gap-6 lg:grid-cols-2">
        <!-- Datos personales -->
        <section class="card p-6">
          <h2 class="font-display mb-5 flex items-center gap-2 text-lg font-bold">
            <lucide-icon name="user" [size]="19" class="text-clay-600" />
            Datos personales
          </h2>

          <form [formGroup]="formularioPerfil" (ngSubmit)="guardarPerfil()" class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label">Nombres</label>
                <input formControlName="nombre" class="input" />
              </div>
              <div>
                <label class="label">Apellidos</label>
                <input formControlName="apellidos" class="input" />
              </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label">Celular</label>
                <input formControlName="telefono" class="input" />
              </div>
              <div>
                <label class="label">DNI</label>
                <input formControlName="dni" class="input" />
              </div>
            </div>
            <div>
              <label class="label">Correo</label>
              <input [value]="auth.usuario()?.email" class="input" disabled />
              <p class="mt-1 text-xs text-stone-400">El correo no se puede cambiar</p>
            </div>
            <button type="submit" class="btn-primary" [disabled]="guardando()">
              <lucide-icon name="check" [size]="16" />
              Guardar cambios
            </button>
          </form>
        </section>

        <!-- Direcciones -->
        <section class="card p-6">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="font-display flex items-center gap-2 text-lg font-bold">
              <lucide-icon name="map-pin" [size]="19" class="text-clay-600" />
              Mis direcciones
            </h2>
            <button
              type="button"
              class="btn-ghost !py-1.5 text-clay-700"
              (click)="alternarFormularioDireccion()"
            >
              <lucide-icon [name]="mostrandoFormulario() ? 'x' : 'plus'" [size]="16" />
              {{ mostrandoFormulario() ? 'Cancelar' : 'Agregar' }}
            </button>
          </div>

          @if (mostrandoFormulario()) {
            <form
              [formGroup]="formularioDireccion"
              (ngSubmit)="guardarDireccion()"
              class="mb-5 grid gap-3 rounded-xl bg-cream-100 p-4 sm:grid-cols-2"
            >
              <input
                formControlName="nombre_completo"
                class="input sm:col-span-2"
                placeholder="Nombre de quien recibe"
              />
              <input formControlName="telefono" class="input" placeholder="Celular" />
              <input formControlName="ciudad" class="input" placeholder="Ciudad" />
              <input formControlName="distrito" class="input" placeholder="Distrito" />
              <input formControlName="direccion" class="input" placeholder="Dirección" />
              <input
                formControlName="referencia"
                class="input sm:col-span-2"
                placeholder="Referencia (opcional)"
              />
              <button type="submit" class="btn-primary sm:col-span-2">Guardar dirección</button>
            </form>
          }

          @if (direcciones().length === 0 && !mostrandoFormulario()) {
            <p class="py-6 text-center text-sm text-stone-500">
              Aún no tienes direcciones guardadas.
            </p>
          }

          <ul class="space-y-3">
            @for (dir of direcciones(); track dir.id) {
              <li class="rounded-xl border border-stone-200 p-4 text-sm">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-semibold text-stone-800">
                    {{ dir.nombre_completo }}
                    @if (dir.es_predeterminada) {
                      <span class="badge ml-1 bg-andes-100 text-andes-700">Principal</span>
                    }
                  </p>
                  <div class="flex gap-1">
                    @if (!dir.es_predeterminada) {
                      <button
                        type="button"
                        class="cursor-pointer p-1 text-stone-400 hover:text-andes-600"
                        title="Marcar como principal"
                        (click)="marcarPrincipal(dir)"
                      >
                        <lucide-icon name="star" [size]="16" />
                      </button>
                    }
                    <button
                      type="button"
                      class="cursor-pointer p-1 text-stone-400 hover:text-red-600"
                      title="Eliminar"
                      (click)="eliminarDireccion(dir)"
                    >
                      <lucide-icon name="trash-2" [size]="16" />
                    </button>
                  </div>
                </div>
                <p class="mt-1 text-stone-600">
                  {{ dir.direccion }}, {{ dir.distrito }}, {{ dir.ciudad }}
                </p>
                <p class="flex items-center gap-1.5 text-stone-500">
                  <lucide-icon name="phone" [size]="13" /> {{ dir.telefono }}
                </p>
              </li>
            }
          </ul>
        </section>
      </div>
    </div>
  `,
})
export class Perfil {
  readonly auth = inject(AuthService);
  private readonly direccionService = inject(DireccionService);
  private readonly toast = inject(ToastService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly fb = inject(FormBuilder);

  readonly direcciones = signal<DireccionEnvio[]>([]);
  readonly mostrandoFormulario = signal(false);
  readonly guardando = signal(false);

  readonly formularioPerfil = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellidos: [''],
    telefono: [''],
    dni: [''],
  });

  readonly formularioDireccion = this.fb.nonNullable.group({
    nombre_completo: ['', Validators.required],
    telefono: ['', Validators.required],
    ciudad: ['', Validators.required],
    distrito: ['', Validators.required],
    direccion: ['', Validators.required],
    referencia: [''],
  });

  constructor() {
    const usuario = this.auth.usuario();
    if (usuario) {
      this.formularioPerfil.patchValue({
        nombre: usuario.nombre,
        apellidos: usuario.apellidos ?? '',
        telefono: usuario.telefono ?? '',
        dni: usuario.dni ?? '',
      });
      void this.cargarDirecciones();
    }
  }

  private async cargarDirecciones(): Promise<void> {
    const usuario = this.auth.usuario();
    if (usuario) this.direcciones.set(await this.direccionService.listar(usuario.id));
  }

  alternarFormularioDireccion(): void {
    this.mostrandoFormulario.set(!this.mostrandoFormulario());
  }

  async guardarPerfil(): Promise<void> {
    if (this.formularioPerfil.invalid) return;
    this.guardando.set(true);
    try {
      await this.auth.actualizarPerfil(this.formularioPerfil.getRawValue());
      this.toast.exito('Perfil actualizado');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      this.guardando.set(false);
    }
  }

  async guardarDireccion(): Promise<void> {
    const usuario = this.auth.usuario();
    if (!usuario || this.formularioDireccion.invalid) {
      this.formularioDireccion.markAllAsTouched();
      return;
    }
    await this.direccionService.guardar({
      ...this.formularioDireccion.getRawValue(),
      usuario_id: usuario.id,
    });
    this.formularioDireccion.reset();
    this.mostrandoFormulario.set(false);
    this.toast.exito('Dirección guardada');
    await this.cargarDirecciones();
  }

  async marcarPrincipal(dir: DireccionEnvio): Promise<void> {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    await this.direccionService.marcarPredeterminada(dir.id, usuario.id);
    await this.cargarDirecciones();
  }

  async eliminarDireccion(dir: DireccionEnvio): Promise<void> {
    const ok = await this.confirmacion.pedir({
      titulo: 'Eliminar dirección',
      mensaje: `¿Eliminar la dirección de ${dir.nombre_completo}?`,
      textoConfirmar: 'Eliminar',
      peligroso: true,
    });
    if (!ok) return;
    await this.direccionService.eliminar(dir.id);
    await this.cargarDirecciones();
  }
}
