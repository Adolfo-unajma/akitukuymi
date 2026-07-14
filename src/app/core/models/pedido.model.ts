import { DireccionSnapshot } from './direccion.model';
import { Perfil } from './usuario.model';

export type EstadoPedido =
  | 'pago_pendiente'
  | 'pago_subido'
  | 'confirmado'
  | 'empaquetado'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

/** Orden natural del flujo (sin contar cancelado) */
export const FLUJO_PEDIDO: EstadoPedido[] = [
  'pago_pendiente',
  'pago_subido',
  'confirmado',
  'empaquetado',
  'en_camino',
  'entregado',
];

export interface EstadoInfo {
  etiqueta: string;
  descripcion: string;
  icono: string;
  /** Clases Tailwind para el badge */
  clases: string;
}

export const ESTADOS_PEDIDO: Record<EstadoPedido, EstadoInfo> = {
  pago_pendiente: {
    etiqueta: 'Pago pendiente',
    descripcion: 'Esperando que subas tu comprobante de Yape',
    icono: 'clock',
    clases: 'bg-amber-100 text-amber-800',
  },
  pago_subido: {
    etiqueta: 'Verificando pago',
    descripcion: 'Recibimos tu comprobante, lo estamos verificando',
    icono: 'qr-code',
    clases: 'bg-sky-100 text-sky-800',
  },
  confirmado: {
    etiqueta: 'Confirmado',
    descripcion: 'Pago verificado, tu pedido está en preparación',
    icono: 'circle-check',
    clases: 'bg-andes-100 text-andes-700',
  },
  empaquetado: {
    etiqueta: 'Empaquetado',
    descripcion: 'Tu pedido está listo para salir',
    icono: 'package-check',
    clases: 'bg-violet-100 text-violet-800',
  },
  en_camino: {
    etiqueta: 'En camino',
    descripcion: 'Tu pedido va en camino a tu dirección',
    icono: 'truck',
    clases: 'bg-blue-100 text-blue-800',
  },
  entregado: {
    etiqueta: 'Entregado',
    descripcion: '¡Pedido entregado, gracias por tu compra!',
    icono: 'circle-check',
    clases: 'bg-emerald-100 text-emerald-800',
  },
  cancelado: {
    etiqueta: 'Cancelado',
    descripcion: 'Este pedido fue cancelado',
    icono: 'circle-x',
    clases: 'bg-red-100 text-red-700',
  },
};

export interface ItemPedido {
  id: string;
  pedido_id: string;
  producto_id: string;
  /** Datos congelados al momento de la compra */
  nombre_producto: string;
  imagen_url?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface HistorialEstado {
  id: string;
  pedido_id: string;
  estado: EstadoPedido;
  notas?: string;
  creado_en: string;
}

export interface Pedido {
  id: string;
  usuario_id: string;
  numero_pedido: string;
  estado: EstadoPedido;
  monto_total: number;
  metodo_pago: string;
  numero_operacion?: string;
  comprobante_url?: string;
  notas?: string;
  direccion_envio: DireccionSnapshot;
  items?: ItemPedido[];
  historial?: HistorialEstado[];
  usuario?: Perfil;
  creado_en: string;
}
