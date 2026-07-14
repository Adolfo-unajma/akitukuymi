import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Home: se renderiza en el servidor en cada visita (datos frescos de Supabase)
  { path: '', renderMode: RenderMode.Server },
  // Páginas estáticas: se prerenderizan para carga instantánea
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'registro', renderMode: RenderMode.Prerender },

  // El resto depende de datos/sesión del navegador: se renderiza en el cliente
  { path: '**', renderMode: RenderMode.Client },
];
