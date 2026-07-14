import { Injectable, inject } from '@angular/core';
import { Perfil, RolUsuario } from '../models';
import { USUARIOS_DEMO, UsuarioDemo } from '../data/demo-data';
import { DemoDbService } from './demo-db.service';
import { SupabaseService } from './supabase.service';

/** Gestión de usuarios para el panel admin */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly sb = inject(SupabaseService);
  private readonly db = inject(DemoDbService);

  async listar(): Promise<Perfil[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client
        .from('perfiles')
        .select('*')
        .order('creado_en', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Perfil[];
    }
    return this.db
      .leer<UsuarioDemo>('usuarios', USUARIOS_DEMO)
      .map(({ password: _p, ...perfil }) => perfil);
  }

  async cambiarRol(usuarioId: string, rol: RolUsuario): Promise<void> {
    if (this.sb.habilitado) {
      const { error } = await this.sb.client.from('perfiles').update({ rol }).eq('id', usuarioId);
      if (error) throw new Error('No se pudo cambiar el rol');
      return;
    }
    this.db.guardar(
      'usuarios',
      this.db
        .leer<UsuarioDemo>('usuarios', USUARIOS_DEMO)
        .map((u) => (u.id === usuarioId ? { ...u, rol } : u)),
    );
  }
}
