import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { esSoloLectura } from '../../core/solo-lectura';
import { AuthService } from '../../core/services/auth.service';
import { Logo } from '../../shared/components/logo';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule, Logo],
  template: `
    <div class="flex min-h-dvh bg-stone-100">
      <!-- Barra lateral -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-stone-200 bg-white transition-transform lg:static lg:translate-x-0"
        [class.-translate-x-full]="!menuAbierto()"
      >
        <div class="flex items-center justify-between border-b border-stone-100 p-4">
          <a routerLink="/admin" class="flex items-center gap-2">
            <app-logo [tamano]="32" [conTexto]="false" />
            <span class="font-display font-bold text-stone-900">
              Admin
              <span class="block text-[10px] font-medium text-stone-400 uppercase">
                Akitukuymi
              </span>
            </span>
          </a>
          <button
            type="button"
            class="btn-ghost !p-2 lg:hidden"
            (click)="menuAbierto.set(false)"
            aria-label="Cerrar menú"
          >
            <lucide-icon name="x" [size]="18" />
          </button>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto p-3">
          @for (enlace of enlaces; track enlace.ruta) {
            <a
              [routerLink]="enlace.ruta"
              routerLinkActive="!bg-clay-50 !text-clay-700 font-semibold"
              [routerLinkActiveOptions]="{ exact: enlace.exacto }"
              class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-50 hover:text-stone-900"
              (click)="menuAbierto.set(false)"
            >
              <lucide-icon [name]="enlace.icono" [size]="18" />
              {{ enlace.texto }}
            </a>
          }
        </nav>

        <div class="border-t border-stone-100 p-3">
          <a
            routerLink="/"
            class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
          >
            <lucide-icon name="store" [size]="18" />
            Ver la tienda
          </a>
          <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50"
            (click)="auth.logout()"
          >
            <lucide-icon name="log-out" [size]="18" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- Fondo del menú móvil -->
      @if (menuAbierto()) {
        <div
          class="fixed inset-0 z-30 bg-stone-900/40 lg:hidden"
          (click)="menuAbierto.set(false)"
        ></div>
      }

      <!-- Contenido -->
      <div class="flex min-w-0 flex-1 flex-col">
        <header
          class="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-stone-200 bg-white/90 px-4 backdrop-blur"
        >
          <button
            type="button"
            class="btn-ghost !p-2 lg:hidden"
            (click)="menuAbierto.set(true)"
            aria-label="Abrir menú"
          >
            <lucide-icon name="menu" [size]="20" />
          </button>
          <p class="text-sm text-stone-500">
            Hola, <b class="text-stone-800">{{ auth.usuario()?.nombre }}</b>
          </p>

          @if (soloLectura) {
            <span
              class="ml-auto flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
            >
              <lucide-icon name="eye" [size]="13" />
              Modo demostración · solo lectura
            </span>
          }
        </header>

        <main class="flex-1 p-4 sm:p-6 lg:p-8">
          @if (soloLectura) {
            <div
              class="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <lucide-icon name="info" [size]="18" class="mt-0.5 shrink-0" />
              <p>
                Estás viendo el panel en <b>modo demostración</b>. Puedes navegar y revisar
                todo, pero los cambios (crear, editar, eliminar o cambiar estados) están
                desactivados temporalmente.
              </p>
            </div>
          }
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class AdminLayout {
  readonly auth = inject(AuthService);
  readonly menuAbierto = signal(false);
  readonly soloLectura = esSoloLectura();

  readonly enlaces = [
    { texto: 'Dashboard', ruta: '/admin', icono: 'layout-dashboard', exacto: true },
    { texto: 'Pedidos', ruta: '/admin/pedidos', icono: 'clipboard-list', exacto: false },
    { texto: 'Productos', ruta: '/admin/productos', icono: 'package', exacto: false },
    { texto: 'Categorías', ruta: '/admin/categorias', icono: 'tag', exacto: false },
    { texto: 'Lanas', ruta: '/admin/lanas', icono: 'layers', exacto: false },
    { texto: 'Usuarios', ruta: '/admin/usuarios', icono: 'users', exacto: false },
  ];
}
