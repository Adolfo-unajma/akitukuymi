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
        class="panel-chat card fixed right-4 bottom-24 z-[60] flex h-[30rem] max-h-[calc(100vh-8rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden shadow-2xl shadow-clay-900/20"
      >
        <div
          class="flex items-center gap-3 bg-gradient-to-br from-clay-600 to-clay-800 px-4 py-3.5 text-white"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <lucide-icon name="bot" [size]="20" />
          </span>
          <div class="flex-1">
            <p class="font-display text-sm font-semibold">Asistente Akitukuymi</p>
            <p class="flex items-center gap-1.5 text-[11px] text-white/75">
              <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
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
            <div
              class="burbuja flex"
              [class]="m.de === 'usuario' ? 'justify-end' : 'justify-start'"
            >
              <p
                class="max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm"
                [class]="
                  m.de === 'usuario'
                    ? 'rounded-br-md bg-clay-600 text-white'
                    : 'rounded-bl-md border border-stone-200/80 bg-white text-stone-700'
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
      class="group fixed right-4 bottom-6 z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-clay-600 text-white shadow-xl shadow-clay-900/25 transition-all duration-300 hover:scale-105 hover:bg-clay-700 active:scale-95"
      aria-label="Abrir chat de ayuda"
    >
      @if (!abierto()) {
        <span
          class="absolute inset-0 animate-ping rounded-full bg-clay-500/40 [animation-duration:2.5s]"
        ></span>
      }
      <lucide-icon
        [name]="abierto() ? 'x' : 'message-circle'"
        [size]="24"
        class="relative transition-transform duration-300 group-hover:scale-110"
      />
    </button>
  `,
  styles: `
    @keyframes panel-entra {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    .panel-chat {
      animation: panel-entra 0.28s cubic-bezier(0.22, 1, 0.36, 1);
      transform-origin: bottom right;
    }
    @keyframes burbuja-entra {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    .burbuja {
      animation: burbuja-entra 0.25s ease-out;
    }
    @media (prefers-reduced-motion: reduce) {
      .panel-chat,
      .burbuja {
        animation: none;
      }
    }
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
