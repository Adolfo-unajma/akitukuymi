export interface DireccionEnvio {
  id: string;
  usuario_id: string;
  nombre_completo: string;
  telefono: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  referencia?: string;
  es_predeterminada: boolean;
  creado_en?: string;
}

/** Copia de la dirección que se congela dentro del pedido */
export type DireccionSnapshot = Omit<DireccionEnvio, 'id' | 'usuario_id' | 'es_predeterminada' | 'creado_en'>;
