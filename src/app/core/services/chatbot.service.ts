import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { DemoDbService } from './demo-db.service';

/**
 * Chatbot de la tienda.
 * Cuando `environment.n8n.chatWebhookUrl` esté configurado, cada mensaje se
 * envía al flujo de n8n (que a su vez consulta DeepSeek). Mientras tanto,
 * responde con mensajes de demostración.
 */
@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly db = inject(DemoDbService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sessionId = this.db.uid();

  get conectado(): boolean {
    return !!environment.n8n.chatWebhookUrl;
  }

  /** Contexto del visitante para que el bot personalice sus respuestas */
  private get metadata() {
    const usuario = this.auth.usuario();
    return {
      nombre: usuario ? `${usuario.nombre} ${usuario.apellidos ?? ''}`.trim() : null,
      email: usuario?.email ?? null,
      autenticado: !!usuario,
      pagina: this.router.url,
    };
  }

  async enviar(mensaje: string): Promise<string> {
    if (this.conectado) {
      try {
        const respuesta = await firstValueFrom(
          this.http.post<Record<string, string>>(environment.n8n.chatWebhookUrl, {
            sessionId: this.sessionId,
            action: 'sendMessage',
            chatInput: mensaje,
            metadata: this.metadata,
          }),
        );
        return (
          respuesta?.['output'] ??
          respuesta?.['respuesta'] ??
          respuesta?.['text'] ??
          'Lo siento, no pude procesar tu mensaje.'
        );
      } catch {
        return 'Ocurrió un problema al conectar con el asistente. Inténtalo de nuevo.';
      }
    }
    return this.respuestaDemo(mensaje);
  }

  private respuestaDemo(mensaje: string): string {
    const texto = mensaje.toLowerCase();
    if (/(hola|buen)/.test(texto)) {
      return '¡Hola! Soy el asistente de Akitukuymi. Puedo ayudarte con productos, precios, envíos y formas de pago. (Modo demo: pronto estaré conectado con n8n + DeepSeek)';
    }
    if (/(pago|yape|pagar)/.test(texto)) {
      return 'Aceptamos pagos con Yape: al finalizar tu pedido verás el código QR y subes tu comprobante. Nosotros lo verificamos y preparamos tu pedido.';
    }
    if (/(envio|envío|entrega|demora)/.test(texto)) {
      return 'Hacemos envíos a todo el Perú. El tiempo de entrega depende de tu ciudad; te contactamos por WhatsApp para coordinar.';
    }
    if (/(precio|cu[aá]nto)/.test(texto)) {
      return 'Puedes ver todos los precios en el catálogo. También tenemos ofertas especiales en gorros, llaveros y ramos tejidos.';
    }
    return 'Gracias por tu mensaje. Cuando esté conectado a n8n + DeepSeek podré responderte cualquier consulta. Por ahora, escríbenos por WhatsApp para atención inmediata.';
  }
}
