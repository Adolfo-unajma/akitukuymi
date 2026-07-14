import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  tablerBrandFacebook,
  tablerBrandInstagram,
  tablerBrandTiktok,
  tablerBrandWhatsapp,
} from '@ng-icons/tabler-icons';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { Logo } from './logo';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LucideAngularModule, NgIcon, Logo],
  providers: [
    provideIcons({
      tablerBrandInstagram,
      tablerBrandFacebook,
      tablerBrandTiktok,
      tablerBrandWhatsapp,
    }),
  ],
  template: `
    <footer class="mt-16 border-t border-clay-900/20 bg-clay-950 text-cream-200">
      <div class="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <app-logo [claro]="true" />
          <p class="mt-4 text-sm leading-relaxed text-cream-200/70">
            Chompas, gorros, amigurumis, mantas y ramos tejidos a mano con dedicación.
            Cada pieza es única, hecha con lana de calidad.
          </p>
          <div class="mt-5 flex gap-2">
            <a
              [href]="contacto.instagram"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              class="red-social"
            >
              <ng-icon name="tablerBrandInstagram" size="19" />
            </a>
            <a
              [href]="contacto.facebook"
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              class="red-social"
            >
              <ng-icon name="tablerBrandFacebook" size="19" />
            </a>
            <a
              [href]="contacto.tiktok"
              target="_blank"
              rel="noopener"
              aria-label="TikTok"
              class="red-social"
            >
              <ng-icon name="tablerBrandTiktok" size="19" />
            </a>
            <a
              [href]="'https://wa.me/' + contacto.whatsapp"
              target="_blank"
              rel="noopener"
              aria-label="WhatsApp"
              class="red-social"
            >
              <ng-icon name="tablerBrandWhatsapp" size="19" />
            </a>
          </div>
        </div>

        <div>
          <h3 class="font-display mb-4 font-semibold text-cream-100">Tienda</h3>
          <ul class="space-y-2.5 text-sm">
            <li><a routerLink="/catalogo" class="enlace">Catálogo completo</a></li>
            <li>
              <a routerLink="/catalogo" [queryParams]="{ ofertas: 1 }" class="enlace">Ofertas</a>
            </li>
            <li><a routerLink="/carrito" class="enlace">Mi carrito</a></li>
            <li><a routerLink="/mis-pedidos" class="enlace">Mis pedidos</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-display mb-4 font-semibold text-cream-100">Ayuda</h3>
          <ul class="space-y-2.5 text-sm">
            <li>
              <button type="button" class="enlace cursor-pointer" (click)="irASeccion('como-comprar')">
                Cómo comprar
              </button>
            </li>
            <li>
              <button type="button" class="enlace cursor-pointer" (click)="irASeccion('lanas')">
                Precios de lanas
              </button>
            </li>
            <li>
              <a
                [href]="'https://wa.me/' + contacto.whatsapp + '?text=Hola,%20tengo%20una%20consulta'"
                target="_blank"
                rel="noopener"
                class="enlace"
              >
                Atención por WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-display mb-4 font-semibold text-cream-100">Contacto</h3>
          <ul class="space-y-3 text-sm text-cream-200/80">
            <li class="flex items-center gap-2.5">
              <lucide-icon name="phone" [size]="16" class="text-clay-400" />
              +51 977 477 674
            </li>
            <li class="flex items-center gap-2.5">
              <lucide-icon name="mail" [size]="16" class="text-clay-400" />
              {{ contacto.email }}
            </li>
            <li class="flex items-center gap-2.5">
              <lucide-icon name="map-pin" [size]="16" class="text-clay-400" />
              {{ contacto.ubicacion }}
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-cream-100/10 py-5">
        <p class="container-app text-center text-xs text-cream-200/50">
          © {{ anio }} Akitukuymi · Tienda artesanal. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  `,
  styles: `
    .enlace {
      color: color-mix(in srgb, var(--color-cream-200) 80%, transparent);
    }
    .enlace:hover {
      color: var(--color-cream-100);
      text-decoration: underline;
    }
    .red-social {
      display: flex;
      width: 2.25rem;
      height: 2.25rem;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: color-mix(in srgb, var(--color-cream-100) 10%, transparent);
      color: var(--color-cream-100);
      transition: background 0.2s;
    }
    .red-social:hover {
      background: var(--color-clay-600);
    }
  `,
})
export class Footer {
  private readonly router = inject(Router);

  readonly contacto = environment.contacto;
  readonly anio = new Date().getFullYear();

  /** Baja a una sección del inicio sin dejar #fragmento en la URL */
  async irASeccion(id: string): Promise<void> {
    if (this.router.url.split('#')[0] !== '/') {
      await this.router.navigate(['/']);
      // Espera a que el home termine de renderizar
      await new Promise((r) => setTimeout(r, 350));
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
