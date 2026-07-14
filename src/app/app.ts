import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmacionDialogo } from './shared/components/confirmacion-dialogo';
import { Toasts } from './shared/components/toasts';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toasts, ConfirmacionDialogo],
  templateUrl: './app.html',
})
export class App {}
