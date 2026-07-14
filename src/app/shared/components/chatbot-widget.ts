import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ChatbotService } from '../../core/services/chatbot.service';

interface MensajeChat {
  de: 'usuario' | 'bot';
  texto: string;
}

/**
 * Burbuja de chat flotante.
 * Integración lista para n8n + DeepSeek: solo falta configurar
 * `environment.n8n.chatWebhookUrl`.
 */
@Component({
  selector: 'app-chatbot-widget',
  imports: [FormsModule, LucideAngularModule],
  template: `
    <!-- Panel -->
    @if (abierto()) {
      <div
        class="card fixed right-4 bottom-24 z-[60] flex h-[28rem] w-80 max-w-[calc(100vw-2rem)] flex-col overflow-hidden shadow-2xl"
      >
        <div class="flex items-center gap-3 bg-clay-700 px-4 py-3 text-white">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <lucide-icon name="bot" [size]="20" />
          </span>
          <div class="flex-1">
            <p class="text-sm font-semibold">Asistente Akitukuymi</p>
            <p class="text-[11px] text-white/70">
              {{ chatbot.conectado ? 'En línea' : 'Modo demo' }}
            </p>
          </div>
          <button
            type="button"
            (click)="abierto.set(false)"
            aria-label="Cerrar chat"
            class="cursor-pointer text-white/70 hover:text-white"
          >
            <lucide-icon name="x" [size]="18" />
          </button>
        </div>

        <div #hilo class="flex-1 space-y-3 overflow-y-auto bg-cream-50 p-4">
          @for (m of mensajes(); track $index) {
            <div [class]="m.de === 'usuario' ? 'flex justify-end' : 'flex justify-start'">
              <p
                class="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
                [class]="
                  m.de === 'usuario'
                    ? 'rounded-br-sm bg-clay-600 text-white'
                    : 'rounded-bl-sm border border-stone-200 bg-white text-stone-700'
                "
              >
                {{ m.texto }}
              </p>
            </div>
          }
          @if (escribiendo()) {
            <div class="flex justify-start">
              <p
                class="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-stone-200 bg-white px-3.5 py-3"
              >
                @for (punto of [0, 1, 2]; track punto) {
                  <span
                    class="h-2 w-2 animate-bounce rounded-full bg-clay-400"
                    [style.animation-delay.ms]="punto * 150"
                  ></span>
                }
              </p>
            </div>
          }
        </div>

        <form
          class="flex items-center gap-2 border-t border-stone-200 bg-white p-3"
          (ngSubmit)="enviar()"
        >
          <input
            type="text"
            name="mensaje"
            [(ngModel)]="borrador"
            placeholder="Escribe tu consulta…"
            autocomplete="off"
            class="input !rounded-full !py-2"
          />
          <button
            type="submit"
            class="btn-primary !p-2.5"
            [disabled]="!borrador.trim() || escribiendo()"
            aria-label="Enviar mensaje"
          >
            <lucide-icon name="send" [size]="16" />
          </button>
        </form>
      </div>
    }

    <!-- Botón flotante -->
    <button
      type="button"
      (click)="alternar()"
      class="fixed right-4 bottom-6 z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-clay-600 text-white shadow-xl transition hover:scale-105 hover:bg-clay-700"
      aria-label="Abrir chat de ayuda"
    >
      <lucide-icon [name]="abierto() ? 'x' : 'message-circle'" [size]="24" />
    </button>
  `,
})
export class ChatbotWidget {
  readonly chatbot = inject(ChatbotService);
  private readonly hilo = viewChild<ElementRef<HTMLElement>>('hilo');

  readonly abierto = signal(false);
  readonly escribiendo = signal(false);
  readonly mensajes = signal<MensajeChat[]>([
    {
      de: 'bot',
      texto: '¡Hola! Soy el asistente de Akitukuymi. ¿En qué puedo ayudarte hoy?',
    },
  ]);
  borrador = '';

  alternar(): void {
    this.abierto.set(!this.abierto());
  }

  async enviar(): Promise<void> {
    const texto = this.borrador.trim();
    if (!texto || this.escribiendo()) return;
    this.borrador = '';
    this.mensajes.update((m) => [...m, { de: 'usuario', texto }]);
    this.escribiendo.set(true);
    this.bajarAlFinal();

    const respuesta = await this.chatbot.enviar(texto);
    this.mensajes.update((m) => [...m, { de: 'bot', texto: respuesta }]);
    this.escribiendo.set(false);
    this.bajarAlFinal();
  }

  /** Mantiene la conversación siempre visible en el último mensaje */
  private bajarAlFinal(): void {
    setTimeout(() => {
      const el = this.hilo()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
