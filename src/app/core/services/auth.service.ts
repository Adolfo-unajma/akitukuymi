import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Perfil } from '../models';
import { USUARIOS_DEMO, UsuarioDemo } from '../data/demo-data';
import { DemoDbService } from './demo-db.service';
import { SupabaseService } from './supabase.service';

const CLAVE_SESION_DEMO = 'aki_sesion_demo';

export interface DatosRegistro {
  nombre: string;
  apellidos: string;
  telefono: string;
  dni?: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sb = inject(SupabaseService);
  private readonly demoDb = inject(DemoDbService);
  private readonly router = inject(Router);

  readonly usuario = signal<Perfil | null>(null);
  readonly cargando = signal(true);
  readonly estaAutenticado = computed(() => !!this.usuario());
  readonly esAdmin = computed(() => this.usuario()?.rol === 'admin');

  /** Se resuelve cuando ya se sabe si hay sesión activa (para los guards) */
  readonly listo: Promise<void>;
  private resolverListo!: () => void;

  constructor() {
    this.listo = new Promise((resolver) => (this.resolverListo = resolver));
    if (!this.sb.enNavegador) {
      this.terminarCarga();
    } else if (this.sb.habilitado) {
      void this.iniciarSupabase();
    } else {
      this.iniciarDemo();
    }
  }

  private terminarCarga(): void {
    this.cargando.set(false);
    this.resolverListo();
  }

  // ─────────────────────────── Supabase (modo real) ───────────────────────────

  private async iniciarSupabase(): Promise<void> {
    const { data } = await this.sb.client.auth.getSession();
    if (data.session) await this.cargarPerfil(data.session.user.id);
    this.terminarCarga();

    this.sb.client.auth.onAuthStateChange((evento, sesion) => {
      if (evento === 'SIGNED_IN' && sesion) void this.cargarPerfil(sesion.user.id);
      if (evento === 'SIGNED_OUT') this.usuario.set(null);
    });
  }

  private async cargarPerfil(usuarioId: string): Promise<void> {
    const { data, error } = await this.sb.client
      .from('perfiles')
      .select('*')
      .eq('id', usuarioId)
      .single();
    if (!error && data) this.usuario.set(data as Perfil);
  }

  // ───────────────────────────── Modo demo ─────────────────────────────

  private iniciarDemo(): void {
    try {
      const crudo = localStorage.getItem(CLAVE_SESION_DEMO);
      if (crudo) this.usuario.set(JSON.parse(crudo) as Perfil);
    } catch {
      /* sesión demo corrupta */
    }
    this.terminarCarga();
  }

  private usuariosDemo(): UsuarioDemo[] {
    return this.demoDb.leer('usuarios', USUARIOS_DEMO);
  }

  private guardarSesionDemo(perfil: Perfil): void {
    this.usuario.set(perfil);
    localStorage.setItem(CLAVE_SESION_DEMO, JSON.stringify(perfil));
  }

  // ───────────────────────────── API pública ─────────────────────────────

  async login(email: string, password: string): Promise<void> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client.auth.signInWithPassword({ email, password });
      if (error) throw new Error('Correo o contraseña incorrectos');
      await this.cargarPerfil(data.user.id);
      return;
    }
    const encontrado = this.usuariosDemo().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!encontrado) throw new Error('Correo o contraseña incorrectos');
    const { password: _omitida, ...perfil } = encontrado;
    this.guardarSesionDemo(perfil);
  }

  async loginConGoogle(): Promise<void> {
    if (this.sb.habilitado) {
      const { error } = await this.sb.client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: location.origin },
      });
      if (error) throw new Error('No se pudo iniciar sesión con Google');
      return;
    }
    // Demo: simula un acceso con Google
    this.guardarSesionDemo({
      id: 'user-google-demo',
      email: 'google@demo.pe',
      nombre: 'Usuario',
      apellidos: 'Google (demo)',
      rol: 'cliente',
    });
  }

  async registrar(datos: DatosRegistro): Promise<void> {
    if (this.sb.habilitado) {
      const { error } = await this.sb.client.auth.signUp({
        email: datos.email,
        password: datos.password,
        options: {
          data: {
            nombre: datos.nombre,
            apellidos: datos.apellidos,
            telefono: datos.telefono,
            dni: datos.dni ?? null,
          },
        },
      });
      if (error) {
        const codigo = (error as { code?: string }).code ?? '';
        if (codigo === 'user_already_exists' || error.message.includes('already registered')) {
          throw new Error('Este correo ya está registrado');
        }
        if (codigo === 'email_address_invalid') {
          throw new Error('Ese correo no es válido: usa un correo real que pueda recibir mensajes');
        }
        if (codigo === 'over_email_send_rate_limit') {
          throw new Error('Se alcanzó el límite de correos de confirmación, espera unos minutos');
        }
        if (codigo === 'weak_password') {
          throw new Error('La contraseña es muy débil, usa al menos 8 caracteres variados');
        }
        throw new Error('No se pudo completar el registro, inténtalo de nuevo');
      }
      return;
    }
    const usuarios = this.usuariosDemo();
    if (usuarios.some((u) => u.email.toLowerCase() === datos.email.trim().toLowerCase())) {
      throw new Error('Este correo ya está registrado');
    }
    const nuevo: UsuarioDemo = {
      id: this.demoDb.uid(),
      email: datos.email.trim(),
      nombre: datos.nombre,
      apellidos: datos.apellidos,
      telefono: datos.telefono,
      dni: datos.dni,
      rol: 'cliente',
      password: datos.password,
      creado_en: new Date().toISOString(),
    };
    this.demoDb.guardar('usuarios', [...usuarios, nuevo]);
    const { password: _omitida, ...perfil } = nuevo;
    this.guardarSesionDemo(perfil);
  }

  async logout(): Promise<void> {
    if (this.sb.habilitado) await this.sb.client.auth.signOut();
    if (this.sb.enNavegador) localStorage.removeItem(CLAVE_SESION_DEMO);
    this.usuario.set(null);
    void this.router.navigate(['/']);
  }

  async actualizarPerfil(cambios: Partial<Perfil>): Promise<void> {
    const actual = this.usuario();
    if (!actual) throw new Error('No hay sesión activa');

    if (this.sb.habilitado) {
      const { error } = await this.sb.client.from('perfiles').update(cambios).eq('id', actual.id);
      if (error) throw new Error('No se pudo actualizar el perfil');
      this.usuario.set({ ...actual, ...cambios });
      return;
    }
    const usuarios = this.usuariosDemo().map((u) =>
      u.id === actual.id ? { ...u, ...cambios } : u,
    );
    this.demoDb.guardar('usuarios', usuarios);
    this.guardarSesionDemo({ ...actual, ...cambios });
  }
}
