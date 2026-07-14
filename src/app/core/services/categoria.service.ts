import { Injectable, inject } from '@angular/core';
import { Categoria } from '../models';
import { CATEGORIAS_DEMO, PRODUCTOS_DEMO } from '../data/demo-data';
import { DemoDbService } from './demo-db.service';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly sb = inject(SupabaseService);
  private readonly db = inject(DemoDbService);

  async listarActivas(): Promise<Categoria[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('orden');
      if (error) throw error;
      return (data ?? []) as Categoria[];
    }
    return this.db
      .leer('categorias', CATEGORIAS_DEMO)
      .filter((c) => c.activo)
      .sort((a, b) => a.orden - b.orden);
  }

  async listarTodas(): Promise<Categoria[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client
        .from('categorias')
        .select('*, productos(count)')
        .order('orden');
      if (error) throw error;
      return (data ?? []).map((c: any) => ({
        ...c,
        productos_count: c.productos?.[0]?.count ?? 0,
        productos: undefined,
      })) as Categoria[];
    }
    const productos = this.db.leer('productos', PRODUCTOS_DEMO);
    return this.db
      .leer('categorias', CATEGORIAS_DEMO)
      .map((c) => ({
        ...c,
        productos_count: productos.filter((p) => p.categoria_id === c.id).length,
      }))
      .sort((a, b) => a.orden - b.orden);
  }

  async guardar(categoria: Partial<Categoria>): Promise<void> {
    if (this.sb.habilitado) {
      const { error } = categoria.id
        ? await this.sb.client.from('categorias').update(categoria).eq('id', categoria.id)
        : await this.sb.client.from('categorias').insert(categoria);
      if (error) throw new Error('No se pudo guardar la categoría');
      return;
    }
    const lista = this.db.leer('categorias', CATEGORIAS_DEMO);
    if (categoria.id) {
      this.db.guardar(
        'categorias',
        lista.map((c) => (c.id === categoria.id ? { ...c, ...categoria } : c)),
      );
    } else {
      const nueva: Categoria = {
        id: this.db.uid(),
        nombre: categoria.nombre ?? '',
        slug: (categoria.nombre ?? '').toLowerCase().replace(/\s+/g, '-'),
        descripcion: categoria.descripcion,
        imagen_url: categoria.imagen_url,
        orden: categoria.orden ?? lista.length + 1,
        activo: categoria.activo ?? true,
        creado_en: new Date().toISOString(),
      };
      this.db.guardar('categorias', [...lista, nueva]);
    }
  }

  async eliminar(id: string): Promise<void> {
    if (this.sb.habilitado) {
      const { error } = await this.sb.client.from('categorias').delete().eq('id', id);
      if (error) throw new Error('No se pudo eliminar (verifica que no tenga productos)');
      return;
    }
    this.db.guardar(
      'categorias',
      this.db.leer('categorias', CATEGORIAS_DEMO).filter((c) => c.id !== id),
    );
  }
}
