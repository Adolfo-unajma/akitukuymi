import { Component } from '@angular/core';

/** Placeholder con pulso mientras cargan los productos */
@Component({
  selector: 'app-producto-skeleton',
  template: `
    <div class="card overflow-hidden">
      <div class="aspect-square w-full animate-pulse bg-stone-200"></div>
      <div class="space-y-2 p-4">
        <div class="h-2.5 w-1/3 animate-pulse rounded bg-stone-200"></div>
        <div class="h-3.5 w-3/4 animate-pulse rounded bg-stone-200"></div>
        <div class="flex items-center justify-between pt-2">
          <div class="h-5 w-16 animate-pulse rounded bg-stone-200"></div>
          <div class="h-9 w-9 animate-pulse rounded-full bg-stone-200"></div>
        </div>
      </div>
    </div>
  `,
})
export class ProductoSkeleton {}
