import { Categoria } from './categoria.model';

export interface Producto {
  id: string;
  categoria_id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  /** Precio normal en soles */
  precio: number;
  /** Precio con descuento; null/undefined = sin oferta */
  precio_oferta?: number | null;
  stock: number;
  imagen_url?: string;
  destacado: boolean;
  activo: boolean;
  creado_en?: string;
  /** Relación embebida (select con join) */
  categoria?: Categoria;
}

/** Precio efectivo de venta (oferta si existe) */
export function precioVenta(p: Producto): number {
  return p.precio_oferta != null && p.precio_oferta > 0 ? p.precio_oferta : p.precio;
}
