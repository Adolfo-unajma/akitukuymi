import {
  Component,
  ElementRef,
  afterNextRender,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import type { ReactElement } from 'react';
import type { Root } from 'react-dom/client';
import type { MascotState } from './types';

/**
 * Envoltorio Angular que monta la mascota (isla React + framer-motion) dentro
 * de la app. React y la mascota se cargan de forma perezosa y SOLO en el
 * navegador, para no afectar el SSR ni el bundle inicial.
 *
 * `px` fija el tamaño visible; el SVG se escala manteniendo su nitidez.
 *
 * Uso:  <app-mascota [estado]="'thinking'" [px]="64" />
 */
@Component({
  selector: 'app-mascota',
  template: `
    <span
      [style.width.px]="px()"
      [style.height.px]="px()"
      style="position:relative;display:inline-block;line-height:0"
    >
      <span
        #host
        style="position:absolute;top:50%;left:50%;line-height:0"
        [style.transform]="'translate(-50%,-50%) scale(' + px() / 130 + ')'"
      ></span>
    </span>
  `,
})
export class MascotaComponent {
  /** Estado que controla la lógica del chatbot */
  readonly estado = input<MascotState>('idle');
  /** Tamaño visible en píxeles */
  readonly px = input<number>(64);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly listo = signal(false);

  // Referencias a React cargadas de forma diferida
  private root: Root | null = null;
  private createElement!: (t: unknown, p: Record<string, unknown>) => ReactElement;
  private Mascot!: unknown;

  constructor() {
    // Monta React únicamente en el cliente
    afterNextRender(async () => {
      try {
        const [reactMod, clientMod, mod] = await Promise.all([
          import('react'),
          import('react-dom/client'),
          import('./AKITUKUYMI_Mascot'),
        ]);
        // Interop CJS/ESM: las funciones pueden estar directas o bajo `default`
        const react = reactMod as unknown as Record<string, unknown>;
        const client = clientMod as unknown as Record<string, unknown>;
        const createElement = (react['createElement'] ??
          (react['default'] as Record<string, unknown>)?.['createElement']) as never;
        const createRoot = (client['createRoot'] ??
          (client['default'] as Record<string, unknown>)?.['createRoot']) as (
          el: Element,
        ) => Root;
        this.createElement = createElement;
        this.Mascot = mod.AKITUKUYMI_Mascot;
        this.root = createRoot(this.host().nativeElement);
        this.listo.set(true);
        this.pintar();
      } catch (e) {
        console.error('No se pudo montar la mascota:', e);
      }
    });

    // Re-renderiza al cambiar el estado
    effect(() => {
      this.estado();
      if (this.listo()) this.pintar();
    });
  }

  private pintar(): void {
    if (!this.root) return;
    this.root.render(
      this.createElement(this.Mascot, {
        state: this.estado(),
        size: 'sm',
      }),
    );
  }

  ngOnDestroy(): void {
    this.root?.unmount();
    this.root = null;
  }
}
