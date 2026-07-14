import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../environments/environment';
import { DireccionEnvio, DireccionSnapshot, Pedido, precioVenta } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CarritoService } from '../../core/services/carrito.service';
import { DireccionService } from '../../core/services/direccion.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="container-app max-w-4xl py-10">
      <h1 class="font-display mb-2 text-3xl font-bold text-stone-900">Finalizar compra</h1>

      <!-- Indicador de pasos -->
      <ol class="mb-10 flex items-center gap-2 text-sm">
        @for (etiqueta of ['Envío', 'Pago', 'Listo']; track etiqueta; let i = $index) {
          <li class="flex items-center gap-2">
            <span
              class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              [class]="
                paso() > i + 1
                  ? 'bg-andes-600 text-white'
                  : paso() === i + 1
                    ? 'bg-clay-600 text-white'
                    : 'bg-stone-200 text-stone-500'
              "
            >
              @if (paso() > i + 1) {
                <lucide-icon name="check" [size]="14" />
              } @else {
                {{ i + 1 }}
              }
            </span>
            <span
              [class]="paso() === i + 1 ? 'font-semibold text-stone-900' : 'text-stone-500'"
            >
              {{ etiqueta }}
            </span>
            @if (i < 2) {
              <span class="mx-1 h-px w-8 bg-stone-300 sm:w-14"></span>
            }
          </li>
        }
      </ol>

      <!-- ══════ PASO 1: Dirección ══════ -->
      @if (paso() === 1) {
        <div class="grid items-start gap-8 lg:grid-cols-[1fr_18rem]">
          <div class="card p-6">
            <h2 class="font-display mb-5 flex items-center gap-2 text-lg font-bold">
              <lucide-icon name="map-pin" [size]="20" class="text-clay-600" />
              ¿Dónde entregamos tu pedido?
            </h2>

            @if (direcciones().length > 0 && !mostrandoFormulario()) {
              <div class="space-y-3">
                @for (dir of direcciones(); track dir.id) {
                  <label
                    class="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition"
                    [class]="
                      direccionElegida()?.id === dir.id
                        ? 'border-clay-500 bg-clay-50'
                        : 'border-stone-200 hover:border-stone-300'
                    "
                  >
                    <input
                      type="radio"
                      name="direccion"
                      class="mt-1 accent-clay-600"
                      [checked]="direccionElegida()?.id === dir.id"
                      (change)="direccionElegida.set(dir)"
                    />
                    <span class="text-sm">
                      <span class="font-semibold text-stone-800">
                        {{ dir.nombre_completo }}
                        @if (dir.es_predeterminada) {
                          <span class="badge ml-1 bg-andes-100 text-andes-700">Principal</span>
                        }
                      </span>
                      <span class="mt-0.5 block text-stone-600">
                        {{ dir.direccion }}, {{ dir.distrito }}, {{ dir.ciudad }}
                      </span>
                      <span class="flex items-center gap-1.5 text-stone-500">
                        <lucide-icon name="phone" [size]="13" /> {{ dir.telefono }}
                      </span>
                    </span>
                  </label>
                }
                <button type="button" class="btn-ghost" (click)="mostrandoFormulario.set(true)">
                  <lucide-icon name="plus" [size]="16" />
                  Usar otra dirección
                </button>
              </div>
            } @else {
              <form [formGroup]="formularioDireccion" class="grid gap-4 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="label">Nombre de quien recibe</label>
                  <input formControlName="nombre_completo" class="input" placeholder="Nombre completo" />
                </div>
                <div>
                  <label class="label">Celular de contacto</label>
                  <input formControlName="telefono" class="input" placeholder="977 000 000" />
                </div>
                <div>
                  <label class="label">Ciudad</label>
                  <input formControlName="ciudad" class="input" placeholder="Huancayo" />
                </div>
                <div>
                  <label class="label">Distrito</label>
                  <input formControlName="distrito" class="input" placeholder="El Tambo" />
                </div>
                <div>
                  <label class="label">Dirección</label>
                  <input formControlName="direccion" class="input" placeholder="Jr. Los Andes 123" />
                </div>
                <div class="sm:col-span-2">
                  <label class="label">Referencia <span class="text-stone-400">(opcional)</span></label>
                  <input
                    formControlName="referencia"
                    class="input"
                    placeholder="Frente al parque, casa de dos pisos…"
                  />
                </div>
                @if (direcciones().length > 0) {
                  <button
                    type="button"
                    class="btn-ghost justify-self-start"
                    (click)="mostrandoFormulario.set(false)"
                  >
                    <lucide-icon name="arrow-left" [size]="15" />
                    Volver a mis direcciones
                  </button>
                }
              </form>
            }

            <button type="button" class="btn-primary mt-6 w-full !py-3" (click)="continuarAPago()">
              Continuar al pago
              <lucide-icon name="arrow-right" [size]="17" />
            </button>
          </div>

          <!-- Resumen -->
          <aside class="card p-5">
            <h3 class="font-display mb-3 font-bold">Tu pedido</h3>
            <ul class="space-y-2.5 text-sm">
              @for (item of carrito.items(); track item.producto.id) {
                <li class="flex justify-between gap-2">
                  <span class="text-stone-600">{{ item.cantidad }}× {{ item.producto.nombre }}</span>
                  <span class="font-medium whitespace-nowrap">
                    {{ precio(item.producto) * item.cantidad | currency: 'PEN' : 'S/ ' }}
                  </span>
                </li>
              }
            </ul>
            <p class="mt-4 flex justify-between border-t border-stone-200 pt-3 font-bold">
              Total
              <span class="text-clay-700">{{ carrito.total() | currency: 'PEN' : 'S/ ' }}</span>
            </p>
          </aside>
        </div>
      }

      <!-- ══════ PASO 2: Pago con Yape ══════ -->
      @if (paso() === 2) {
        <div class="card mx-auto max-w-xl p-6 sm:p-8">
          <h2 class="font-display mb-1 flex items-center gap-2 text-lg font-bold">
            <lucide-icon name="qr-code" [size]="20" class="text-clay-600" />
            Paga {{ carrito.total() | currency: 'PEN' : 'S/ ' }} con Yape
          </h2>
          <p class="mb-6 text-sm text-stone-500">
            Escanea el código QR desde tu app de Yape y luego sube la captura del pago.
          </p>

          <div class="grid gap-6 sm:grid-cols-2">
            <div class="flex flex-col items-center rounded-2xl bg-cream-100 p-5">
              <img
                [src]="qrUrl"
                alt="Código QR de Yape"
                class="w-full max-w-52 rounded-xl border-4 border-white shadow"
              />
              <p class="mt-3 text-center text-xs text-stone-600">
                Titular: <b>{{ titular }}</b>
              </p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="label" for="operacion">N.º de operación</label>
                <input
                  id="operacion"
                  class="input"
                  placeholder="Ej. 03424859"
                  [value]="numeroOperacion()"
                  (input)="numeroOperacion.set($any($event.target).value)"
                />
                <p class="mt-1 text-xs text-stone-400">Aparece en tu constancia de Yape</p>
              </div>

              <div>
                <label class="label">Captura del pago</label>
                <label
                  class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-stone-300 p-5 text-center text-sm text-stone-500 transition hover:border-clay-400 hover:bg-clay-50"
                >
                  @if (vistaPrevia()) {
                    <img
                      [src]="vistaPrevia()"
                      alt="Vista previa del comprobante"
                      class="max-h-36 rounded-lg object-contain"
                    />
                    <span class="text-xs text-andes-600">Toca para cambiar la imagen</span>
                  } @else {
                    <lucide-icon name="upload" [size]="26" class="text-stone-400" />
                    <span>Sube tu comprobante<br /><b>JPG o PNG</b></span>
                  }
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="elegirComprobante($event)"
                  />
                </label>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" class="btn-ghost" (click)="paso.set(1)">
              <lucide-icon name="arrow-left" [size]="16" />
              Volver
            </button>
            <button
              type="button"
              class="btn-primary !px-8 !py-3"
              [disabled]="enviando()"
              (click)="confirmarPedido()"
            >
              @if (enviando()) {
                <lucide-icon name="loader-circle" [size]="18" class="animate-spin" />
                Registrando pedido…
              } @else {
                Confirmar pedido
                <lucide-icon name="check" [size]="18" />
              }
            </button>
          </div>
        </div>
      }

      <!-- ══════ PASO 3: Éxito ══════ -->
      @if (paso() === 3 && pedidoCreado(); as pedido) {
        <div class="card mx-auto flex max-w-lg flex-col items-center gap-4 p-10 text-center">
          <span class="flex h-20 w-20 items-center justify-center rounded-full bg-andes-100">
            <lucide-icon name="circle-check" [size]="40" class="text-andes-600" />
          </span>
          <h2 class="font-display text-2xl font-bold text-stone-900">¡Pedido registrado!</h2>
          <p class="text-stone-600">
            Tu pedido <b class="text-clay-700">{{ pedido.numero_pedido }}</b> fue creado.
            Verificaremos tu pago y te avisaremos cuando esté confirmado.
          </p>
          <div class="mt-2 flex flex-wrap justify-center gap-3">
            <a [routerLink]="['/mis-pedidos', pedido.id]" class="btn-primary">
              Seguir mi pedido
              <lucide-icon name="arrow-right" [size]="16" />
            </a>
            <a routerLink="/catalogo" class="btn-outline">Seguir comprando</a>
          </div>
        </div>
      }
    </div>
  `,
})
export class Checkout {
  readonly carrito = inject(CarritoService);
  private readonly auth = inject(AuthService);
  private readonly direccionService = inject(DireccionService);
  private readonly pedidoService = inject(PedidoService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly paso = signal<1 | 2 | 3>(1);
  readonly direcciones = signal<DireccionEnvio[]>([]);
  readonly direccionElegida = signal<DireccionEnvio | null>(null);
  readonly mostrandoFormulario = signal(false);
  readonly numeroOperacion = signal('');
  readonly comprobante = signal<File | null>(null);
  readonly vistaPrevia = signal<string | null>(null);
  readonly enviando = signal(false);
  readonly pedidoCreado = signal<Pedido | null>(null);

  readonly qrUrl = environment.pagos.qrUrl;
  readonly titular = environment.pagos.titular;
  precio = precioVenta;

  readonly formularioDireccion = this.fb.nonNullable.group({
    nombre_completo: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    ciudad: ['', Validators.required],
    distrito: ['', Validators.required],
    direccion: ['', Validators.required],
    referencia: [''],
  });

  constructor() {
    // Sin productos no hay checkout
    if (this.carrito.items().length === 0) {
      void this.router.navigate(['/catalogo']);
      return;
    }
    void this.cargarDirecciones();
  }

  private async cargarDirecciones(): Promise<void> {
    const usuario = this.auth.usuario();
    if (!usuario) return;
    const lista = await this.direccionService.listar(usuario.id);
    this.direcciones.set(lista);
    this.direccionElegida.set(lista.find((d) => d.es_predeterminada) ?? lista[0] ?? null);
    this.mostrandoFormulario.set(lista.length === 0);
    // Prellenar con datos del perfil
    this.formularioDireccion.patchValue({
      nombre_completo: `${usuario.nombre} ${usuario.apellidos ?? ''}`.trim(),
      telefono: usuario.telefono ?? '',
    });
  }

  private get snapshotDireccion(): DireccionSnapshot | null {
    if (!this.mostrandoFormulario() && this.direccionElegida()) {
      const d = this.direccionElegida()!;
      return {
        nombre_completo: d.nombre_completo,
        telefono: d.telefono,
        direccion: d.direccion,
        distrito: d.distrito,
        ciudad: d.ciudad,
        referencia: d.referencia,
      };
    }
    if (this.formularioDireccion.valid) {
      return this.formularioDireccion.getRawValue();
    }
    return null;
  }

  continuarAPago(): void {
    if (!this.snapshotDireccion) {
      this.formularioDireccion.markAllAsTouched();
      this.toast.error('Completa los datos de envío para continuar');
      return;
    }
    this.paso.set(2);
  }

  elegirComprobante(evento: Event): void {
    const archivo = (evento.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    this.comprobante.set(archivo);
    const lector = new FileReader();
    lector.onload = () => this.vistaPrevia.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  async confirmarPedido(): Promise<void> {
    const usuario = this.auth.usuario();
    const direccion = this.snapshotDireccion;
    if (!usuario || !direccion) return;

    if (!this.numeroOperacion().trim()) {
      this.toast.error('Ingresa el número de operación de Yape');
      return;
    }
    if (!this.comprobante()) {
      this.toast.error('Sube la captura de tu pago para continuar');
      return;
    }

    this.enviando.set(true);
    try {
      // Guarda la dirección nueva para futuras compras
      if (this.mostrandoFormulario()) {
        await this.direccionService.guardar({ ...direccion, usuario_id: usuario.id });
      }
      const pedido = await this.pedidoService.crear({
        usuarioId: usuario.id,
        items: this.carrito.items(),
        direccion,
      });
      await this.pedidoService.subirComprobante(
        pedido.id,
        this.comprobante()!,
        this.numeroOperacion().trim(),
      );
      this.carrito.vaciar();
      this.pedidoCreado.set(pedido);
      this.paso.set(3);
      this.toast.exito('¡Pedido registrado con éxito!');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo registrar el pedido');
    } finally {
      this.enviando.set(false);
    }
  }
}
