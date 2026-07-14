import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Perfil } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmacionService } from '../../core/services/confirmacion.service';
import { ToastService } from '../../core/services/toast.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { Spinner } from '../../shared/components/spinner';

@Component({
  selector: 'app-admin-usuarios',
  imports: [DatePipe, FormsModule, LucideAngularModule, Spinner],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-2xl font-bold text-stone-900">Usuarios</h1>
      <label
        class="input flex w-72 max-w-full items-center gap-2.5 focus-within:border-clay-500 focus-within:ring-2 focus-within:ring-clay-200"
      >
        <lucide-icon name="search" [size]="16" class="shrink-0 text-stone-400" />
        <input
          type="search"
          class="w-full bg-transparent outline-none placeholder:text-stone-400"
          placeholder="Buscar por nombre o correo…"
          [ngModel]="buscar()"
          (ngModelChange)="buscar.set($event)"
        />
      </label>
    </div>

    @if (cargando()) {
      <app-spinner mensaje="Cargando usuarios…" />
    } @else {
      <div class="card overflow-x-auto">
        <table class="w-full min-w-[36rem] text-sm">
          <thead class="bg-stone-50 text-left text-xs text-stone-500 uppercase">
            <tr>
              <th class="px-4 py-3">Usuario</th>
              <th class="px-4 py-3">Contacto</th>
              <th class="px-4 py-3">Registro</th>
              <th class="px-4 py-3">Rol</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-stone-100">
            @for (usuario of filtrados(); track usuario.id) {
              <tr class="hover:bg-stone-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-andes-600 text-sm font-bold text-white"
                    >
                      {{ usuario.nombre.charAt(0).toUpperCase() }}
                    </span>
                    <span class="font-medium">
                      {{ usuario.nombre }} {{ usuario.apellidos ?? '' }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-stone-500">
                  {{ usuario.email }}
                  @if (usuario.telefono) {
                    <span class="flex items-center gap-1 text-xs">
                      <lucide-icon name="phone" [size]="11" /> {{ usuario.telefono }}
                    </span>
                  }
                </td>
                <td class="px-4 py-3 text-stone-500">
                  {{ usuario.creado_en | date: 'd MMM y' }}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="badge"
                    [class]="
                      usuario.rol === 'admin'
                        ? 'bg-clay-100 text-clay-800'
                        : 'bg-stone-100 text-stone-600'
                    "
                  >
                    <lucide-icon
                      [name]="usuario.rol === 'admin' ? 'shield-check' : 'user'"
                      [size]="12"
                    />
                    {{ usuario.rol === 'admin' ? 'Admin' : 'Cliente' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  @if (usuario.id !== auth.usuario()?.id) {
                    <button
                      type="button"
                      class="btn-outline !px-3 !py-1.5 !text-xs"
                      (click)="alternarRol(usuario)"
                    >
                      {{ usuario.rol === 'admin' ? 'Quitar admin' : 'Hacer admin' }}
                    </button>
                  } @else {
                    <span class="text-xs text-stone-400">(tú)</span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-4 py-10 text-center text-stone-400">
                  No se encontraron usuarios
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AdminUsuarios {
  private readonly usuarioService = inject(UsuarioService);
  private readonly toast = inject(ToastService);
  private readonly confirmacion = inject(ConfirmacionService);
  readonly auth = inject(AuthService);

  readonly usuarios = signal<Perfil[]>([]);
  readonly cargando = signal(true);
  readonly buscar = signal('');

  readonly filtrados = computed(() => {
    const texto = this.buscar().toLowerCase().trim();
    if (!texto) return this.usuarios();
    return this.usuarios().filter(
      (u) =>
        u.nombre.toLowerCase().includes(texto) ||
        (u.apellidos ?? '').toLowerCase().includes(texto) ||
        u.email.toLowerCase().includes(texto),
    );
  });

  constructor() {
    void this.cargar();
  }

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.usuarios.set(await this.usuarioService.listar());
    this.cargando.set(false);
  }

  async alternarRol(usuario: Perfil): Promise<void> {
    const nuevoRol = usuario.rol === 'admin' ? 'cliente' : 'admin';
    const ok = await this.confirmacion.pedir({
      titulo: nuevoRol === 'admin' ? 'Dar acceso de admin' : 'Quitar acceso de admin',
      mensaje:
        nuevoRol === 'admin'
          ? `${usuario.nombre} podrá administrar productos, pedidos y usuarios. ¿Continuar?`
          : `${usuario.nombre} dejará de tener acceso al panel de administración. ¿Continuar?`,
      textoConfirmar: 'Sí, cambiar rol',
      peligroso: nuevoRol === 'admin',
    });
    if (!ok) return;
    try {
      await this.usuarioService.cambiarRol(usuario.id, nuevoRol);
      this.toast.exito(`Rol actualizado para ${usuario.nombre}`);
      await this.cargar();
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo cambiar el rol');
    }
  }
}
