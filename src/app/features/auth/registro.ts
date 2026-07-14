import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { Logo } from '../../shared/components/logo';

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
                <p class="error-text">Ingresa tu nombre</p>
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
                <p class="error-text">Ingresa tus apellidos</p>
              }
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label" for="telefono">Celular</label>
              <input
                id="telefono"
                formControlName="telefono"
                class="input"
                placeholder="977 000 000"
                autocomplete="tel"
              />
              @if (invalido('telefono')) {
                <p class="error-text">Ingresa un celular válido (9 dígitos)</p>
              }
            </div>
            <div>
              <label class="label" for="dni">DNI <span class="text-stone-400">(opcional)</span></label>
              <input id="dni" formControlName="dni" class="input" placeholder="12345678" />
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
                placeholder="Mínimo 8 caracteres"
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
            @if (invalido('password')) {
              <p class="error-text">La contraseña debe tener al menos 8 caracteres</p>
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

  readonly enviando = signal(false);
  readonly verPassword = signal(false);

  readonly formulario = this.fb.nonNullable.group(
    {
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      dni: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmar: ['', Validators.required],
    },
    {
      validators: (grupo) =>
        grupo.get('password')?.value === grupo.get('confirmar')?.value
          ? null
          : { distintas: true },
    },
  );

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
      const { confirmar: _c, ...datos } = this.formulario.getRawValue();
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
