import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ToastService } from '../../core/services/toast.service';
import { Logo } from '../../shared/components/logo';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, Logo],
  template: `
    <div class="container-app flex justify-center py-14">
      <div class="card w-full max-w-md p-8">
        <div class="mb-8 flex flex-col items-center gap-2 text-center">
          <app-logo [tamano]="48" [conTexto]="false" />
          <h1 class="font-display text-2xl font-bold text-stone-900">¡Bienvenido de nuevo!</h1>
          <p class="text-sm text-stone-500">Ingresa para comprar y seguir tus pedidos</p>
        </div>

        @if (!supabaseActivo) {
          <div
            class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800"
          >
            <p class="mb-1 font-bold">Modo demo (sin Supabase)</p>
            <p>Admin: <b>admin&#64;akitukuymi.pe</b> / <b>Admin123</b></p>
            <p>Cliente: <b>cliente&#64;demo.pe</b> / <b>Cliente123</b></p>
          </div>
        }

        <form [formGroup]="formulario" (ngSubmit)="ingresar()" class="space-y-4">
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
                placeholder="Tu contraseña"
                autocomplete="current-password"
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
              <p class="error-text">La contraseña es obligatoria</p>
            }
          </div>

          <button
            type="submit"
            class="btn-primary w-full !py-3"
            [disabled]="enviando()"
          >
            @if (enviando()) {
              <lucide-icon name="loader-circle" [size]="18" class="animate-spin" />
              Ingresando…
            } @else {
              <lucide-icon name="log-in" [size]="18" />
              Ingresar
            }
          </button>
        </form>

        <div class="my-5 flex items-center gap-3 text-xs text-stone-400">
          <span class="h-px flex-1 bg-stone-200"></span>
          o continúa con
          <span class="h-px flex-1 bg-stone-200"></span>
        </div>

        <button type="button" class="btn-outline w-full !py-3" (click)="conGoogle()">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.02c2.2-2 3.5-5 3.5-8.6z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.1 0-5.8-2.1-6.7-5l-.14.01-3.6 2.8-.05.13C3.4 21.3 7.4 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4l-.01-.16-3.7-2.8-.12.06C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.3l3.9-2.9z"
            />
            <path
              fill="#EB4335"
              d="M12 4.6c2.2 0 3.7 1 4.6 1.8l3.3-3.2C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.7l3.9 2.9c1-2.9 3.6-5 6.7-5z"
            />
          </svg>
          Continuar con Google
        </button>

        <p class="mt-6 text-center text-sm text-stone-600">
          ¿No tienes cuenta?
          <a routerLink="/registro" class="font-semibold text-clay-700 hover:underline">
            Regístrate gratis
          </a>
        </p>
      </div>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly supabaseActivo = inject(SupabaseService).habilitado;
  readonly enviando = signal(false);
  readonly verPassword = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  invalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && control.touched;
  }

  private get destino(): string {
    return this.ruta.snapshot.queryParamMap.get('redirigirA') ?? '/';
  }

  async ingresar(): Promise<void> {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    try {
      const { email, password } = this.formulario.getRawValue();
      await this.auth.login(email, password);
      this.toast.exito(`¡Hola de nuevo, ${this.auth.usuario()?.nombre ?? ''}!`);
      void this.router.navigateByUrl(this.destino);
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo iniciar sesión');
    } finally {
      this.enviando.set(false);
    }
  }

  async conGoogle(): Promise<void> {
    try {
      await this.auth.loginConGoogle();
      if (this.auth.estaAutenticado()) {
        this.toast.exito('¡Bienvenido!');
        void this.router.navigateByUrl(this.destino);
      }
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'No se pudo iniciar con Google');
    }
  }
}
