import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { Logo } from './logo';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, Logo],
  template: `
    <!-- Franja superior -->
    <div
      class="flex items-center justify-center gap-1.5 bg-clay-800 py-1.5 text-xs font-medium text-cream-100"
    >
      <lucide-icon name="heart" [size]="12" />
      Tejido a mano con amor en Perú · Paga fácil con Yape
    </div>

    <header
      class="sticky top-0 z-50 border-b border-stone-200/70 bg-cream-50/90 backdrop-blur-md"
    >
      <nav class="container-app flex h-16 items-center justify-between gap-4">
        <a routerLink="/" aria-label="Ir al inicio" (click)="cerrarMenus()">
          <app-logo />
        </a>

        <!-- Enlaces escritorio -->
        <ul class="hidden items-center gap-1 md:flex">
          @for (enlace of enlaces; track enlace.texto) {
            <li>
              <a
                [routerLink]="enlace.ruta"
                [queryParams]="enlace.params"
                routerLinkActive="!text-clay-700 !bg-clay-50"
                [routerLinkActiveOptions]="{ exact: enlace.exacto }"
                class="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                {{ enlace.texto }}
              </a>
            </li>
          }
        </ul>

        <div class="flex items-center gap-1.5">
          <!-- Carrito -->
          <a
            routerLink="/carrito"
            class="btn-ghost relative !p-2.5"
            aria-label="Ver carrito"
            (click)="cerrarMenus()"
          >
            <lucide-icon name="shopping-cart" [size]="21" />
            @if (carrito.cantidadTotal() > 0) {
              <span
                class="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-600 px-1 text-[11px] font-bold text-white"
              >
                {{ carrito.cantidadTotal() }}
              </span>
            }
          </a>

          <!-- Usuario -->
          @if (auth.usuario(); as usuario) {
            <div class="relative">
              <button
                type="button"
                class="btn-ghost !gap-1.5 !px-2.5"
                (click)="menuUsuario.set(!menuUsuario())"
              >
                <span
                  class="flex h-8 w-8 items-center justify-center rounded-full bg-andes-600 text-sm font-bold text-white"
                >
                  {{ usuario.nombre.charAt(0).toUpperCase() }}
                </span>
                <lucide-icon name="chevron-down" [size]="15" class="hidden sm:block" />
              </button>

              @if (menuUsuario()) {
                <div
                  class="card absolute right-0 z-50 mt-2 w-56 overflow-hidden py-1.5 shadow-xl"
                >
                  <p class="border-b border-stone-100 px-4 py-2.5">
                    <span class="block text-sm font-semibold text-stone-800">
                      {{ usuario.nombre }} {{ usuario.apellidos }}
                    </span>
                    <span class="block truncate text-xs text-stone-500">{{ usuario.email }}</span>
                  </p>
                  @if (auth.esAdmin()) {
                    <a routerLink="/admin" class="item-menu" (click)="cerrarMenus()">
                      <lucide-icon name="layout-dashboard" [size]="16" /> Panel de administración
                    </a>
                  }
                  <a routerLink="/mis-pedidos" class="item-menu" (click)="cerrarMenus()">
                    <lucide-icon name="package" [size]="16" /> Mis pedidos
                  </a>
                  <a routerLink="/perfil" class="item-menu" (click)="cerrarMenus()">
                    <lucide-icon name="user" [size]="16" /> Mi perfil
                  </a>
                  <button
                    type="button"
                    class="item-menu w-full text-left text-red-600"
                    (click)="salir()"
                  >
                    <lucide-icon name="log-out" [size]="16" /> Cerrar sesión
                  </button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="btn-primary hidden !py-2 sm:inline-flex">
              <lucide-icon name="log-in" [size]="16" />
              Ingresar
            </a>
          }

          <!-- Hamburguesa móvil -->
          <button
            type="button"
            class="btn-ghost !p-2.5 md:hidden"
            (click)="menuMovil.set(!menuMovil())"
            aria-label="Abrir menú"
          >
            <lucide-icon [name]="menuMovil() ? 'x' : 'menu'" [size]="22" />
          </button>
        </div>
      </nav>

      <!-- Menú móvil -->
      @if (menuMovil()) {
        <div class="border-t border-stone-200 bg-cream-50 md:hidden">
          <ul class="container-app flex flex-col gap-1 py-3">
            @for (enlace of enlaces; track enlace.texto) {
              <li>
                <a
                  [routerLink]="enlace.ruta"
                  [queryParams]="enlace.params"
                  class="block rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100"
                  (click)="cerrarMenus()"
                >
                  {{ enlace.texto }}
                </a>
              </li>
            }
            @if (!auth.estaAutenticado()) {
              <li class="pt-2">
                <a routerLink="/login" class="btn-primary w-full" (click)="cerrarMenus()">
                  <lucide-icon name="log-in" [size]="16" /> Ingresar
                </a>
              </li>
            }
          </ul>
        </div>
      }
    </header>
  `,
  styles: `
    .item-menu {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: var(--color-stone-700);
      cursor: pointer;
    }
    .item-menu:hover {
      background: var(--color-stone-100);
    }
  `,
})
export class Navbar {
  readonly auth = inject(AuthService);
  readonly carrito = inject(CarritoService);

  readonly menuUsuario = signal(false);
  readonly menuMovil = signal(false);

  readonly enlaces = [
    { texto: 'Inicio', ruta: '/', params: {}, exacto: true },
    { texto: 'Catálogo', ruta: '/catalogo', params: {}, exacto: true },
    { texto: 'Ofertas', ruta: '/catalogo', params: { ofertas: 1 }, exacto: false },
  ];

  cerrarMenus(): void {
    this.menuUsuario.set(false);
    this.menuMovil.set(false);
  }

  salir(): void {
    this.cerrarMenus();
    void this.auth.logout();
  }
}
