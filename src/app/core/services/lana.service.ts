import { Injectable, inject } from '@angular/core';
import { Lana } from '../models';
import { assertEscritura } from '../solo-lectura';
import { LANAS_DEMO } from '../data/demo-data';
import { DemoDbService } from './demo-db.service';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class LanaService {
  private readonly sb = inject(SupabaseService);
  private readonly db = inject(DemoDbService);

  async listarActivas(): Promise<Lana[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client
        .from('lanas')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      if (error) throw error;
      return (data ?? []) as Lana[];
    }
    return this.db.leer('lanas', LANAS_DEMO).filter((l) => l.activo);
  }

  async listarTodas(): Promise<Lana[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client.from('lanas').select('*').order('nombre');
      if (error) throw error;
      return (data ?? []) as Lana[];
    }
    return this.db.leer('lanas', LANAS_DEMO);
  }

  async guardar(lana: Partial<Lana>): Promise<void> {
    assertEscritura();
    if (this.sb.habilitado) {
      const { error } = lana.id
        ? await this.sb.client.from('lanas').update(lana).eq('id', lana.id)
        : await this.sb.client.from('lanas').insert(lana);
      if (error) throw new Error('No se pudo guardar la lana');
      return;
    }
    const lista = this.db.leer('lanas', LANAS_DEMO);
    if (lana.id) {
      this.db.guardar(
        'lanas',
        lista.map((l) => (l.id === lana.id ? { ...l, ...lana } : l)),
      );
    } else {
      const nueva: Lana = {
        id: this.db.uid(),
        nombre: lana.nombre ?? '',
        color: lana.color,
        precio_unidad: lana.precio_unidad ?? 0,
        precio_paquete: lana.precio_paquete ?? 0,
        unidades_por_paquete: lana.unidades_por_paquete ?? 10,
        stock: lana.stock ?? 0,
        activo: lana.activo ?? true,
        creado_en: new Date().toISOString(),
      };
      this.db.guardar('lanas', [...lista, nueva]);
    }
  }

  async eliminar(id: string): Promise<void> {
    assertEscritura();
    if (this.sb.habilitado) {
      const { error } = await this.sb.client.from('lanas').delete().eq('id', id);
      if (error) throw new Error('No se pudo eliminar la lana');
      return;
    }
    this.db.guardar(
      'lanas',
      this.db.leer('lanas', LANAS_DEMO).filter((l) => l.id !== id),
    );
  }
}
