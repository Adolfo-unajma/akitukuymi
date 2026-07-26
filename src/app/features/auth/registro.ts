import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { Logo } from '../../shared/components/logo';
import {
  ETIQUETA_DOCUMENTO,
  TIPOS_DOCUMENTO,
  TipoDocumento,
  documentoValido,
  emailValido,
  esTipoDocumentoValido,
  evaluarPassword,
  fortalezaPassword,
  nombreValido,
  normalizarDocumento,
  normalizarEmail,
  normalizarNombre,
  normalizarTelefonoPe,
} from '../../core/validacion';

// ── Validadores reactivos apoyados en las funciones puras de validacion.ts ──

function validarNombre(control: AbstractControl): ValidationErrors | null {
  const valor = (control.value ?? '') as string;
  return valor && !nombreValido(valor) ? { nombre: true } : null;
}

function validarEmail(control: AbstractControl): ValidationErrors | null {
  const valor = (control.value ?? '') as string;
  return valor && !emailValido(valor) ? { email: true } : null;
}

function validarTelefono(control: AbstractControl): ValidationErrors | null {
  const valor = (control.value ?? '') as string;
  return valor && normalizarTelefonoPe(valor) === null ? { telefono: true } : null;
}

// Valida el número de documento según el tipo seleccionado (validador de grupo).
function validarDocumento(grupo: AbstractControl): ValidationErrors | null {
  const tipo = grupo.get('tipo_documento')?.value as string;
  const numero = (grupo.get('numero_documento')?.value ?? '') as string;
  if (!numero) return null; // "required" ya lo cubre
  if (!esTipoDocumentoValido(tipo)) return null;
  return documentoValido(tipo, normalizarDocumento(numero)) ? null : { documento: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, Logo],
  template: `
    <div class="container-app flex justify-center py-14">
      <div class="card w-full max-w-lg p-8">
        <div class="mb-8 flex flex-col items-center gap-2 text-center">
          <app-logo [tamano]="48" [conTexto]="false" />
          <h1 class="font-display text-2xl font-bold text-stone-900">Crea tu cuenta</h1>
          <p class="text-sm text-stone-500">
            Compra tejidos artesanales y sigue tus pedidos paso a paso
          </p>
        </div>

        <form [formGroup]="formulario" (ngSubmit)="registrar()" class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label" for="nombre">Nombres</label>
              <input id="nombre" formControlName="nombre" class="input" placeholder="María" />
              @if (invalido('nombre')) {
                <p class="error-text">Solo letras (2–60), sin números ni símbolos</p>
              }
            </div>
            <div>
              <label class="label" for="apellidos">Apellidos</label>
              <input
                id="apellidos"
                formControlName="apellidos"
                class="input"
                placeholder="Quispe Díaz"
              />
              @if (invalido('apellidos')) {
                <p class="error-text">Solo letras (2–60), sin números ni símbolos</p>
              }
            </div>
          </div>

          <div>
            <label class="label" for="telefono">Celular</label>
            <input
              id="telefono"
              formControlName="telefono"
              class="input"
              inputmode="tel"
              placeholder="977 000 000"
              autocomplete="tel"
            />
            @if (invalido('telefono')) {
              <p class="error-text">Celular peruano inválido (9 dígitos, empieza en 9)</p>
            }
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label" for="tipo_documento">Tipo de documento</label>
              <select id="tipo_documento" formControlName="tipo_documento" class="input">
                @for (t of tipos; track t) {
                  <option [value]="t">{{ etiqueta(t) }}</option>
                }
              </select>
            </div>
            <div>
              <label class="label" for="numero_documento">Número</label>
              <input
                id="numero_documento"
                formControlName="numero_documento"
                class="input"
                [placeholder]="placeholderDocumento()"
                autocomplete="off"
              />
              @if (numeroDocumentoInvalido()) {
                <p class="error-text">{{ ayudaDocumento() }}</p>
              }
            </div>
          </div>

          <div>
            <label class="label" for="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="input"
              placeholder="tucorreo@ejemplo.com"
              autocomplete="email"
            />
            @if (invalido('email')) {
              <p class="error-text">Ingresa un correo válido</p>
            }
          </div>

          <div>
            <label class="label" for="password">Contraseña</label>
            <div
              class="input flex items-center gap-2.5 focus-within:border-clay-500 focus-within:ring-2 focus-within:ring-clay-200"
            >
              <input
                id="password"
                [type]="verPassword() ? 'text' : 'password'"
                formControlName="password"
                class="w-full bg-transparent outline-none placeholder:text-stone-400"
                placeholder="Mínimo 8 caracteres, letras y números"
                autocomplete="new-password"
              />
              <button
                type="button"
                class="shrink-0 cursor-pointer text-stone-400 hover:text-stone-700"
                (click)="verPassword.set(!verPassword())"
                aria-label="Mostrar contraseña"
              >
                <lucide-icon [name]="verPassword() ? 'eye-off' : 'eye'" [size]="18" />
              </button>
            </div>

            <!-- Medidor de fortaleza -->
            @if (passwordValor()) {
              <div class="mt-2 flex items-center gap-2">
                <div class="flex flex-1 gap-1">
                  @for (i of [0, 1, 2, 3]; track i) {
                    <span
                      class="h-1.5 flex-1 rounded-full transition-colors"
                      [class]="i < fortaleza() ? colorFortaleza() : 'bg-stone-200'"
                    ></span>
                  }
                </div>
                <span class="text-xs font-medium" [class]="textoColorFortaleza()">
                  {{ etiquetaFortaleza() }}
                </span>
              </div>
            }
            @if (invalido('password') && mensajePassword()) {
              <p class="error-text">{{ mensajePassword() }}</p>
            }
          </div>

          <div>
            <label class="label" for="confirmar">Confirmar contraseña</label>
            <input
              id="confirmar"
              type="password"
              formControlName="confirmar"
              class="input"
              placeholder="Repite tu contraseña"
              autocomplete="new-password"
            />
            @if (formulario.hasError('distintas') && formulario.get('confirmar')?.touched) {
              <p class="error-text">Las contraseñas no coinciden</p>
            }
          </div>

          <button type="submit" class="btn-primary w-full !py-3" [disabled]="enviando()">
            @if (enviando()) {
              <lucide-icon name="loader-circle" [size]="18" class="animate-spin" />
              Creando cuenta…
            } @else {
              <lucide-icon name="user-plus" [size]="18" />
              Crear cuenta
            }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-stone-600">
          ¿Ya tienes cuenta?
          <a routerLink="/login" class="font-semibold text-clay-700 hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  `,
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly supabaseActivo = inject(SupabaseService).habilitado;

  readonly tipos = TIPOS_DOCUMENTO;
  readonly enviando = signal(false);
  readonly verPassword = signal(false);

  readonly formulario = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, validarNombre]],
      apellidos: ['', [Validators.required, validarNombre]],
      telefono: ['', [Validators.required, validarTelefono]],
      tipo_documento: ['DNI' as TipoDocumento, Validators.required],
      numero_documento: ['', Validators.required],
      email: ['', [Validators.required, validarEmail]],
      password: ['', [Validators.required, this.validarPassword.bind(this)]],
      confirmar: ['', Validators.required],
    },
    {
      validators: [
        (grupo: AbstractControl) =>
          grupo.get('password')?.value === grupo.get('confirmar')?.value ? null : { distintas: true },
        validarDocumento,
      ],
    },
  );

  // Señales reactivas para el medidor y el placeholder dinámico del documento.
  private readonly passwordCtrl = this.formulario.controls.password;
  readonly passwordValor = signal(this.passwordCtrl.value);
  readonly tipoDocValor = signal(this.formulario.controls.tipo_documento.value);

  readonly fortaleza = computed(() => fortalezaPassword(this.passwordValor()));
  readonly mensajePassword = computed(() => evaluarPassword(this.passwordValor()).error);

  constructor() {
    this.passwordCtrl.valueChanges.subscribe((v) => this.passwordValor.set(v ?? ''));
    this.formulario.controls.tipo_documento.valueChanges.subscribe((t) =>
      this.tipoDocValor.set(t as TipoDocumento),
    );
    // Revalida el número cuando cambia el tipo de documento.
    this.formulario.controls.tipo_documento.valueChanges.subscribe(() =>
      this.formulario.controls.numero_documento.updateValueAndValidity({ emitEvent: false }),
    );
  }

  /** Validador de contraseña con contexto (nombre/apellidos/correo del form). */
  private validarPassword(control: AbstractControl): ValidationErrors | null {
    const valor = (control.value ?? '') as string;
    if (!valor) return null;
    const grupo = control.parent;
    const resultado = evaluarPassword(valor, {
      nombre: grupo?.get('nombre')?.value,
      apellidos: grupo?.get('apellidos')?.value,
      email: grupo?.get('email')?.value,
    });
    return resultado.valida ? null : { password: resultado.error };
  }

  etiqueta(t: TipoDocumento): string {
    return ETIQUETA_DOCUMENTO[t];
  }

  placeholderDocumento(): string {
    return this.tipoDocValor() === 'DNI' ? '12345678' : 'ABC123456';
  }

  ayudaDocumento(): string {
    switch (this.tipoDocValor()) {
      case 'DNI':
        return 'El DNI debe tener 8 dígitos';
      case 'CE':
        return 'El carné debe tener 9–12 caracteres';
      default:
        return 'El pasaporte debe tener 6–12 caracteres';
    }
  }

  numeroDocumentoInvalido(): boolean {
    const ctrl = this.formulario.controls.numero_documento;
    return (
      (ctrl.touched && ctrl.hasError('required')) ||
      (!!ctrl.value && this.formulario.hasError('documento') && ctrl.touched)
    );
  }

  colorFortaleza(): string {
    const f = this.fortaleza();
    if (f <= 1) return 'bg-red-400';
    if (f === 2) return 'bg-amber-400';
    if (f === 3) return 'bg-lime-500';
    return 'bg-green-600';
  }

  textoColorFortaleza(): string {
    const f = this.fortaleza();
    if (f <= 1) return 'text-red-500';
    if (f === 2) return 'text-amber-600';
    if (f === 3) return 'text-lime-600';
    return 'text-green-700';
  }

  etiquetaFortaleza(): string {
    const f = this.fortaleza();
    if (f <= 1) return 'Débil';
    if (f === 2) return 'Aceptable';
    if (f === 3) return 'Buena';
    return 'Fuerte';
  }

  invalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  async registrar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    try {
      const bruto = this.formulario.getRawValue();
      // Normalización final antes de enviar (nunca se confía solo en el input).
      const datos = {
        nombre: normalizarNombre(bruto.nombre),
        apellidos: normalizarNombre(bruto.apellidos),
        telefono: normalizarTelefonoPe(bruto.telefono) ?? bruto.telefono,
        tipo_documento: bruto.tipo_documento,
        dni: normalizarDocumento(bruto.numero_documento),
        email: normalizarEmail(bruto.email),
        password: bruto.password,
      };
      await this.auth.registrar(datos);
      if (this.supabaseActivo) {
        this.toast.exito('Cuenta creada. Revisa tu correo para confirmarla');
        void this.router.navigate(['/login']);
      } else {
        this.toast.exito('¡Cuenta creada, bienvenido a Akitukuymi!');
        void this.router.navigate(['/']);
      }
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo crear la cuenta');
    } finally {
      this.enviando.set(false);
    }
  }
}
