import { Injectable, inject } from '@angular/core';
import { DireccionEnvio } from '../models';
import { DemoDbService } from './demo-db.service';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class DireccionService {
  private readonly sb = inject(SupabaseService);
  private readonly db = inject(DemoDbService);

  async listar(usuarioId: string): Promise<DireccionEnvio[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client
        .from('direcciones_envio')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('es_predeterminada', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DireccionEnvio[];
    }
    return this.db
      .leer<DireccionEnvio>('direcciones', [])
      .filter((d) => d.usuario_id === usuarioId)
      .sort((a, b) => Number(b.es_predeterminada) - Number(a.es_predeterminada));
  }

  async guardar(direccion: Partial<DireccionEnvio> & { usuario_id: string }): Promise<void> {
    if (this.sb.habilitado) {
      const { error } = direccion.id
        ? await this.sb.client.from('direcciones_envio').update(direccion).eq('id', direccion.id)
        : await this.sb.client.from('direcciones_envio').insert(direccion);
      if (error) throw new Error('No se pudo guardar la dirección');
      return;
    }
    const lista = this.db.leer<DireccionEnvio>('direcciones', []);
    if (direccion.id) {
      this.db.guardar(
        'direcciones',
        lista.map((d) => (d.id === direccion.id ? { ...d, ...direccion } : d)),
      );
    } else {
      const nueva: DireccionEnvio = {
        id: this.db.uid(),
        usuario_id: direccion.usuario_id,
        nombre_completo: direccion.nombre_completo ?? '',
        telefono: direccion.telefono ?? '',
        direccion: direccion.direccion ?? '',
        distrito: direccion.distrito ?? '',
        ciudad: direccion.ciudad ?? '',
        referencia: direccion.referencia,
        es_predeterminada: direccion.es_predeterminada ?? lista.length === 0,
        creado_en: new Date().toISOString(),
      };
      this.db.guardar('direcciones', [...lista, nueva]);
    }
  }

  async marcarPredeterminada(id: string, usuarioId: string): Promise<void> {
    if (this.sb.habilitado) {
      await this.sb.client
        .from('direcciones_envio')
        .update({ es_predeterminada: false })
        .eq('usuario_id', usuarioId);
      const { error } = await this.sb.client
        .from('direcciones_envio')
        .update({ es_predeterminada: true })
        .eq('id', id);
      if (error) throw new Error('No se pudo actualizar la dirección');
      return;
    }
    this.db.guardar(
      'direcciones',
      this.db
        .leer<DireccionEnvio>('direcciones', [])
        .map((d) =>
          d.usuario_id === usuarioId ? { ...d, es_predeterminada: d.id === id } : d,
        ),
    );
  }

  async eliminar(id: string): Promise<void> {
    if (this.sb.habilitado) {
      const { error } = await this.sb.client.from('direcciones_envio').delete().eq('id', id);
      if (error) throw new Error('No se pudo eliminar la dirección');
      return;
    }
    this.db.guardar(
      'direcciones',
      this.db.leer<DireccionEnvio>('direcciones', []).filter((d) => d.id !== id),
    );
  }
}
