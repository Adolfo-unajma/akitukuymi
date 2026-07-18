import { Component, input } from '@angular/core';

/** Marca de la tienda: arco tejido Aki Tukuymi + nombre */
@Component({
  selector: 'app-logo',
  template: `
    <span class="flex items-center gap-2.5">
      <img
        src="/img/logo/marca.png"
        alt="Akitukuymi"
        [style.height.px]="tamano()"
        class="w-auto shrink-0 select-none"
        [class.drop-shadow-sm]="claro()"
      />
      @if (conTexto()) {
        <span class="leading-tight">
          <span
            class="font-display block text-xl font-bold tracking-tight"
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
  readonly tamano = input(38);
  readonly conTexto = input(true);
  /** Texto claro para fondos oscuros (p. ej. el footer) */
  readonly claro = input(false);
}
