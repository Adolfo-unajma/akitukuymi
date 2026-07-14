import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ItemCarrito, Producto, precioVenta } from '../models';

const CLAVE_CARRITO = 'aki_carrito';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));

  readonly items = signal<ItemCarrito[]>(this.restaurar());
  readonly cantidadTotal = computed(() => this.items().reduce((acc, i) => acc + i.cantidad, 0));
  readonly total = computed(() =>
    this.items().reduce((acc, i) => acc + precioVenta(i.producto) * i.cantidad, 0),
  );

  constructor() {
    effect(() => {
      const items = this.items();
      if (this.enNavegador) {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
      }
    });
  }

  private restaurar(): ItemCarrito[] {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return [];
    try {
      return JSON.parse(localStorage.getItem(CLAVE_CARRITO) ?? '[]') as ItemCarrito[];
    } catch {
      return [];
    }
  }

  /** Agrega unidades respetando el stock. Devuelve false si ya no hay stock. */
  agregar(producto: Producto, cantidad = 1): boolean {
    const existente = this.items().find((i) => i.producto.id === producto.id);
    const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad;
    if (nuevaCantidad > producto.stock) return false;

    this.items.update((items) =>
      existente
        ? items.map((i) => (i.producto.id === producto.id ? { ...i, cantidad: nuevaCantidad } : i))
        : [...items, { producto, cantidad }],
    );
    return true;
  }

  cambiarCantidad(productoId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitar(productoId);
      return;
    }
    this.items.update((items) =>
      items.map((i) =>
        i.producto.id === productoId
          ? { ...i, cantidad: Math.min(cantidad, i.producto.stock) }
          : i,
      ),
    );
  }

  quitar(productoId: string): void {
    this.items.update((items) => items.filter((i) => i.producto.id !== productoId));
  }

  vaciar(): void {
    this.items.set([]);
  }
}
