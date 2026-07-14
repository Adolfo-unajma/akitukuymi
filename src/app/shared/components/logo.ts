import { Component, input } from '@angular/core';

/** Marca de la tienda: ovillo de lana + nombre */
@Component({
  selector: 'app-logo',
  template: `
    <span class="flex items-center gap-2.5">
      <svg
        [attr.width]="tamano()"
        [attr.height]="tamano()"
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <defs>
          <clipPath [attr.id]="clipId">
            <circle cx="32" cy="32" r="28" />
          </clipPath>
        </defs>
        <circle cx="32" cy="32" r="28" fill="#c34a2a" />
        <g
          [attr.clip-path]="'url(#' + clipId + ')'"
          stroke="#fcfaf6"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
        >
          <path d="M0 22 Q32 6 64 22" />
          <path d="M0 36 Q32 20 64 36" />
          <path d="M0 50 Q32 34 64 50" />
        </g>
      </svg>
      @if (conTexto()) {
        <span class="leading-tight">
          <span
            class="font-display block text-xl font-bold"
            [class]="claro() ? 'text-cream-100' : 'text-clay-800'"
          >
            Akitukuymi
          </span>
          <span
            class="block text-[11px] font-medium tracking-wide uppercase"
            [class]="claro() ? 'text-cream-200/60' : 'text-stone-500'"
          >
            Tejidos hechos a mano
          </span>
        </span>
      }
    </span>
  `,
})
export class Logo {
  private static contador = 0;
  /** Id único por instancia: el logo aparece varias veces en la misma página */
  readonly clipId = `logo-ovillo-${++Logo.contador}`;

  readonly tamano = input(38);
  readonly conTexto = input(true);
  /** Texto claro para fondos oscuros (p. ej. el footer) */
  readonly claro = input(false);
}
