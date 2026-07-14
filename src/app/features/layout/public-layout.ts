import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatbotWidget } from '../../shared/components/chatbot-widget';
import { Footer } from '../../shared/components/footer';
import { Navbar } from '../../shared/components/navbar';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer, ChatbotWidget],
  template: `
    <app-navbar />
    <main class="min-h-[65vh]">
      <router-outlet />
    </main>
    <app-footer />
    <app-chatbot-widget />
  `,
})
export class PublicLayout {}
