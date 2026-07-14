import { Injectable, inject } from '@angular/core';
import {
  DireccionSnapshot,
  EstadoPedido,
  HistorialEstado,
  ItemCarrito,
  ItemPedido,
  Pedido,
  precioVenta,
} from '../models';
import { USUARIOS_DEMO } from '../data/demo-data';
import { assertEscritura } from '../solo-lectura';
import { DemoDbService } from './demo-db.service';
import { ProductoService, leerComoDataUrl } from './producto.service';
import { SupabaseService } from './supabase.service';

export interface DatosNuevoPedido {
  usuarioId: string;
  items: ItemCarrito[];
  direccion: DireccionSnapshot;
  notas?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly sb = inject(SupabaseService);
  private readonly db = inject(DemoDbService);
  private readonly productos = inject(ProductoService);

  private generarNumero(): string {
    const azar = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `AKI-${azar}`;
  }

  async crear(datos: DatosNuevoPedido): Promise<Pedido> {
    assertEscritura();
    const total = datos.items.reduce(
      (acc, i) => acc + precioVenta(i.producto) * i.cantidad,
      0,
    );
    const numero = this.generarNumero();

    if (this.sb.habilitado) {
      const { data: pedido, error } = await this.sb.client
        .from('pedidos')
        .insert({
          usuario_id: datos.usuarioId,
          numero_pedido: numero,
          estado: 'pago_pendiente',
          monto_total: total,
          metodo_pago: 'yape',
          notas: datos.notas ?? null,
          direccion_envio: datos.direccion,
        })
        .select()
        .single();
      if (error || !pedido) throw new Error('No se pudo registrar el pedido');

      const items = datos.items.map((i) => ({
        pedido_id: pedido.id,
        producto_id: i.producto.id,
        nombre_producto: i.producto.nombre,
        imagen_url: i.producto.imagen_url ?? null,
        cantidad: i.cantidad,
        precio_unitario: precioVenta(i.producto),
        subtotal: precioVenta(i.producto) * i.cantidad,
      }));
      const { error: errorItems } = await this.sb.client.from('items_pedido').insert(items);
      if (errorItems) throw new Error('No se pudo registrar el detalle del pedido');

      await this.sb.client.from('historial_estados').insert({
        pedido_id: pedido.id,
        estado: 'pago_pendiente',
        notas: 'Pedido creado',
      });
      await this.productos.descontarStock(
        datos.items.map((i) => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
      );
      return pedido as Pedido;
    }

    // ── Modo demo ──
    const ahora = new Date().toISOString();
    const pedidoId = this.db.uid();
    const items: ItemPedido[] = datos.items.map((i) => ({
      id: this.db.uid(),
      pedido_id: pedidoId,
      producto_id: i.producto.id,
      nombre_producto: i.producto.nombre,
      imagen_url: i.producto.imagen_url,
      cantidad: i.cantidad,
      precio_unitario: precioVenta(i.producto),
      subtotal: precioVenta(i.producto) * i.cantidad,
    }));
    const pedido: Pedido = {
      id: pedidoId,
      usuario_id: datos.usuarioId,
      numero_pedido: numero,
      estado: 'pago_pendiente',
      monto_total: total,
      metodo_pago: 'yape',
      notas: datos.notas,
      direccion_envio: datos.direccion,
      items,
      historial: [
        {
          id: this.db.uid(),
          pedido_id: pedidoId,
          estado: 'pago_pendiente',
          notas: 'Pedido creado',
          creado_en: ahora,
        },
      ],
      creado_en: ahora,
    };
    this.db.guardar('pedidos', [pedido, ...this.db.leer<Pedido>('pedidos', [])]);
    await this.productos.descontarStock(
      datos.items.map((i) => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
    );
    return pedido;
  }

  async subirComprobante(
    pedidoId: string,
    archivo: File,
    numeroOperacion: string,
  ): Promise<void> {
    assertEscritura();
    if (this.sb.habilitado) {
      const ruta = `comprobantes/${pedidoId}-${Date.now()}.${archivo.name.split('.').pop()}`;
      const { error: errorSubida } = await this.sb.client.storage
        .from('comprobantes')
        .upload(ruta, archivo);
      if (errorSubida) throw new Error('No se pudo subir el comprobante');
      const url = this.sb.client.storage.from('comprobantes').getPublicUrl(ruta).data.publicUrl;

      const { error } = await this.sb.client
        .from('pedidos')
        .update({ comprobante_url: url, numero_operacion: numeroOperacion, estado: 'pago_subido' })
        .eq('id', pedidoId);
      if (error) throw new Error('No se pudo actualizar el pedido');
      await this.sb.client.from('historial_estados').insert({
        pedido_id: pedidoId,
        estado: 'pago_subido',
        notas: `Comprobante subido (op. ${numeroOperacion})`,
      });
      return;
    }

    const dataUrl = await leerComoDataUrl(archivo);
    this.actualizarDemo(pedidoId, (p) => ({
      ...p,
      comprobante_url: dataUrl,
      numero_operacion: numeroOperacion,
      estado: 'pago_subido',
      historial: [
        ...(p.historial ?? []),
        {
          id: this.db.uid(),
          pedido_id: pedidoId,
          estado: 'pago_subido' as EstadoPedido,
          notas: `Comprobante subido (op. ${numeroOperacion})`,
          creado_en: new Date().toISOString(),
        },
      ],
    }));
  }

  async misPedidos(usuarioId: string): Promise<Pedido[]> {
    if (this.sb.habilitado) {
      const { data, error } = await this.sb.client
        .from('pedidos')
        .select('*, items:items_pedido(*)')
        .eq('usuario_id', usuarioId)
        .order('creado_en', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Pedido[];
    }
    return this.db
      .leer<Pedido>('pedidos', [])
      .filter((p) => p.usuario_id === usuarioId);
  }

  async obtener(id: string): Promise<Pedido | null> {
    if (this.sb.habilitado) {
      const { data } = await this.sb.client
        .from('pedidos')
        .select('*, items:items_pedido(*), historial:historial_estados(*), usuario:perfiles(*)')
        .eq('id', id)
        .single();
      return (data as Pedido) ?? null;
    }
    const pedido = this.db.leer<Pedido>('pedidos', []).find((p) => p.id === id) ?? null;
    if (pedido) {
      const usuarios = this.db.leer('usuarios', USUARIOS_DEMO);
      pedido.usuario = usuarios.find((u) => u.id === pedido.usuario_id);
    }
    return pedido;
  }

  /** Listado para el panel admin */
  async listarTodos(estado?: EstadoPedido): Promise<Pedido[]> {
    if (this.sb.habilitado) {
      let consulta = this.sb.client
        .from('pedidos')
        .select('*, items:items_pedido(*), usuario:perfiles(*)')
        .order('creado_en', { ascending: false });
      if (estado) consulta = consulta.eq('estado', estado);
      const { data, error } = await consulta;
      if (error) throw error;
      return (data ?? []) as Pedido[];
    }
    const usuarios = this.db.leer('usuarios', USUARIOS_DEMO);
    let lista = this.db.leer<Pedido>('pedidos', []).map((p) => ({
      ...p,
      usuario: usuarios.find((u) => u.id === p.usuario_id),
    }));
    if (estado) lista = lista.filter((p) => p.estado === estado);
    return lista;
  }

  async cambiarEstado(pedidoId: string, estado: EstadoPedido, notas?: string): Promise<void> {
    assertEscritura();
    if (this.sb.habilitado) {
      const { error } = await this.sb.client
        .from('pedidos')
        .update({ estado })
        .eq('id', pedidoId);
      if (error) throw new Error('No se pudo cambiar el estado');
      await this.sb.client.from('historial_estados').insert({
        pedido_id: pedidoId,
        estado,
        notas: notas ?? null,
      });
      return;
    }
    this.actualizarDemo(pedidoId, (p) => ({
      ...p,
      estado,
      historial: [
        ...(p.historial ?? []),
        {
          id: this.db.uid(),
          pedido_id: pedidoId,
          estado,
          notas,
          creado_en: new Date().toISOString(),
        } as HistorialEstado,
      ],
    }));
  }

  private actualizarDemo(pedidoId: string, transformar: (p: Pedido) => Pedido): void {
    this.db.guardar(
      'pedidos',
      this.db.leer<Pedido>('pedidos', []).map((p) => (p.id === pedidoId ? transformar(p) : p)),
    );
  }
}
