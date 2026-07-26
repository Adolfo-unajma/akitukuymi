import { environment } from '../../environments/environment';

/**
 * Mensajes predefinidos y utilidades para abrir conversaciones de WhatsApp.
 *
 * Todo el texto vive aquí para mantener un tono consistente en la tienda y
 * poder ajustarlo en un solo lugar. Usa siempre `whatsappUrl(...)` o alguno de
 * los helpers para construir el enlace `https://wa.me/...`.
 */

const NOMBRE_TIENDA = environment.appName;

/** Construye el enlace de WhatsApp con el mensaje ya codificado. */
export function whatsappUrl(mensaje: string): string {
  return `https://wa.me/${environment.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/** Consulta general sobre un producto específico del catálogo. */
export function whatsappProducto(nombre: string): string {
  return whatsappUrl(
    `¡Hola! 👋 Me interesa *${nombre}* que vi en la tienda de ${NOMBRE_TIENDA} y me encantaría ` +
      `recibir más información sobre su disponibilidad, precio y opciones de entrega. ` +
      `¿Podrían ayudarme, por favor? 🧶`,
  );
}

/** Mensajes reutilizables para botones fijos (hero, footer, secciones). */
export const MENSAJES_WHATSAPP = {
  /** Encargo de un tejido a medida. */
  pedidoPersonalizado:
    `¡Hola! 👋 Me gustaría encargar un tejido personalizado con ${NOMBRE_TIENDA}. ` +
    `¿Podrían contarme sobre las opciones, tiempos de elaboración, precios y formas de entrega? ` +
    `¡Muchas gracias! 🧶`,

  /** Interés en comprar lanas / materiales. */
  lanas:
    `¡Hola! 👋 Estoy interesado/a en las lanas de ${NOMBRE_TIENDA}. ` +
    `¿Me podrían indicar los colores disponibles, precios y cómo hacer mi pedido? ` +
    `¡Gracias! 🧶`,

  /** Consulta o ayuda general (atención al cliente). */
  consulta:
    `¡Hola! 👋 Necesito ayuda con una consulta sobre un producto o mi compra en ${NOMBRE_TIENDA}. ` +
    `¿Podrían orientarme, por favor? 😊`,
} as const;
