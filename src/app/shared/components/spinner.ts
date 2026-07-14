import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-spinner',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center gap-3 py-16 text-stone-500">
      <lucide-icon name="loader-circle" [size]="36" class="animate-spin text-clay-600" />
      <p class="text-sm">{{ mensaje() }}</p>
    </div>
  `,
})
export class Spinner {
  readonly mensaje = input('Cargando…');
}
