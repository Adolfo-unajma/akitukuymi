import { Injectable, inject } from '@angular/core';
import { Producto } from '../models';
import { assertEscritura } from '../solo-lectura';
import { CATEGORIAS_DEMO, PRODUCTOS_DEMO } from '../data/demo-data';
import { DemoDbService } from './demo-db.service';
import { SupabaseService } from './supabase.service';

export interface FiltroProductos {
  categoriaId?: string;
  buscar?: string;
  soloOfertas?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly sb = inject(SupabaseService);
  private readonly db = inject(DemoDbService);

  private demoConCategoria(): Producto[] {
    const categorias = this.db.leer('categorias', CATEGORIAS_DEMO);
    return this.db.leer('productos', PRODUCTOS_DEMO).map((p) => ({
      ...p,
      categoria: categorias.find((c) => c.id === p.categoria_id),
    }));
  }

  async listarActivos(filtro: FiltroProductos = {}): Promise<Producto[]> {
    if (this.sb.habilitado) {
      let consulta = this.sb.client
        .from('productos')
        .select('*, categoria:categorias(*)')
        .eq('activo', true)
        .order('creado_en', { ascending: false });
      if (filtro.categoriaId) consulta = consulta.eq('categoria_id', filtro.categoriaId);
      if (filtro.buscar) consulta = consulta.ilike('nombre', `%${filtro.buscar}%`);
      if (filtro.soloOfertas) consulta = consulta.not('precio_oferta', 'is', null);
      const { data, error } = await consulta;
      if (error) throw error;
      return (data ?? []) as Producto[];
    }

    let lista = this.demoConCategoria().filter((p) => p.activo);
    if (filtro.categoriaId) lista = lista.filter((p) => p.categoria_id === filtro.categoriaId);
    if (filtro.buscar) {
      const texto = filtro.buscar.toLowerCase();
      lista = lista.filter((p) => p.nombre.toLowerCase().includes(texto));
    }
    if (filtro.soloOfertas) lista = lista.filter((p) => p.precio_oferta != null);
    return lista;
  }

  async destacados(): Promise<Producto[]> {
    const lista = await this.listarActivos();
    return lista.filter((p) => p.destacado).slice(0, 8);
  }

  async obtener(id: string): Promise<Producto | null> {
    if (this.sb.habilitado) {
      const { data } = await this.sb.client
        .from('productos')
        .select('*, categoria:categorias(*)')
        .eq('id', id)
        .single();
      return (data as Producto) ?? null;
    }
    return this.demoConCategoria().find((p) => p.id === id) ?? null;
  }

  async relacionados(producto: Producto): Promise<Producto[]> {
    const lista = await this.listarActivos({ categoriaId: producto.categoria_id });
    return lista.filter((p) => p.id !== producto.id).slice(0, 4);
  }

  async listarTodos(): Promise<Producto[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client
        .from('productos')
        .select('*, categoria:categorias(*)')
        .order('creado_en', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Producto[];
    }
    return this.demoConCategoria();
  }

  async guardar(producto: Partial<Producto>): Promise<void> {
    assertEscritura();
    // La relación embebida no se envía a la tabla
    const { categoria: _cat, ...datos } = producto;
    if (this.sb.habilitado) {
      const { error } = datos.id
        ? await this.sb.client.from('productos').update(datos).eq('id', datos.id)
        : await this.sb.client.from('productos').insert(datos);
      if (error) throw new Error('No se pudo guardar el producto');
      return;
    }
    const lista = this.db.leer('productos', PRODUCTOS_DEMO);
    if (datos.id) {
      this.db.guardar(
        'productos',
        lista.map((p) => (p.id === datos.id ? { ...p, ...datos } : p)),
      );
    } else {
      const nuevo: Producto = {
        id: this.db.uid(),
        categoria_id: datos.categoria_id ?? '',
        nombre: datos.nombre ?? '',
        slug: (datos.nombre ?? '').toLowerCase().replace(/\s+/g, '-'),
        descripcion: datos.descripcion,
        precio: datos.precio ?? 0,
        precio_oferta: datos.precio_oferta ?? null,
        stock: datos.stock ?? 0,
        imagen_url: datos.imagen_url,
        destacado: datos.destacado ?? false,
        activo: datos.activo ?? true,
        creado_en: new Date().toISOString(),
      };
      this.db.guardar('productos', [...lista, nuevo]);
    }
  }

  async eliminar(id: string): Promise<void> {
    assertEscritura();
    if (this.sb.habilitado) {
      const { error } = await this.sb.client.from('productos').delete().eq('id', id);
      if (error) throw new Error('No se pudo eliminar el producto');
      return;
    }
    this.db.guardar(
      'productos',
      this.db.leer('productos', PRODUCTOS_DEMO).filter((p) => p.id !== id),
    );
  }

  /** Descuenta stock tras crear un pedido */
  async descontarStock(items: { producto_id: string; cantidad: number }[]): Promise<void> {
    if (this.sb.habilitado) {
      for (const item of items) {
        await this.sb.client.rpc('descontar_stock', {
          p_producto_id: item.producto_id,
          p_cantidad: item.cantidad,
        });
      }
      return;
    }
    const lista = this.db.leer('productos', PRODUCTOS_DEMO).map((p) => {
      const item = items.find((i) => i.producto_id === p.id);
      return item ? { ...p, stock: Math.max(0, p.stock - item.cantidad) } : p;
    });
    this.db.guardar('productos', lista);
  }

  /** Sube una imagen y devuelve su URL pública (en demo: data URL local) */
  async subirImagen(archivo: File): Promise<string> {
    assertEscritura();
    if (this.sb.habilitado) {
      const ruta = `productos/${Date.now()}-${archivo.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
      const { error } = await this.sb.client.storage.from('imagenes').upload(ruta, archivo);
      if (error) throw new Error('No se pudo subir la imagen');
      return this.sb.client.storage.from('imagenes').getPublicUrl(ruta).data.publicUrl;
    }
    return leerComoDataUrl(archivo);
  }
}

export function leerComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result as string);
    lector.onerror = () => rechazar(new Error('No se pudo leer el archivo'));
    lector.readAsDataURL(archivo);
  });
}
