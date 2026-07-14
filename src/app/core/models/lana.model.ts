/** Lanas e hilos vendidos por unidad o por paquete */
export interface Lana {
  id: string;
  nombre: string;
  color?: string;
  precio_unidad: number;
  precio_paquete: number;
  unidades_por_paquete?: number;
  stock?: number;
  activo: boolean;
  creado_en?: string;
}
