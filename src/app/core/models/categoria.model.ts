export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  imagen_url?: string;
  orden: number;
  activo: boolean;
  creado_en?: string;
  /** Solo lectura: cantidad de productos (consulta agregada) */
  productos_count?: number;
}
