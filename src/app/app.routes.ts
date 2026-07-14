import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards/guards';

/**
 * Todas las páginas se cargan con lazy loading (loadComponent) para que el
 * primer render sea liviano. Las rutas privadas están protegidas con guards.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
        title: 'Akitukuymi — Tejidos artesanales hechos a mano',
      },
      {
        path: 'catalogo',
        loadComponent: () => import('./features/catalogo/catalogo').then((m) => m.Catalogo),
        title: 'Catálogo | Akitukuymi',
      },
      {
        path: 'catalogo/:id',
        loadComponent: () =>
          import('./features/catalogo/producto-detalle').then((m) => m.ProductoDetalle),
        title: 'Producto | Akitukuymi',
      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/carrito/carrito').then((m) => m.Carrito),
        title: 'Mi carrito | Akitukuymi',
      },
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login').then((m) => m.Login),
        title: 'Iniciar sesión | Akitukuymi',
      },
      {
        path: 'registro',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/registro').then((m) => m.Registro),
        title: 'Crear cuenta | Akitukuymi',
      },

      // ── Rutas que requieren sesión ──
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./features/checkout/checkout').then((m) => m.Checkout),
        title: 'Finalizar compra | Akitukuymi',
      },
      {
        path: 'mis-pedidos',
        canActivate: [authGuard],
        loadComponent: () => import('./features/cuenta/mis-pedidos').then((m) => m.MisPedidos),
        title: 'Mis pedidos | Akitukuymi',
      },
      {
        path: 'mis-pedidos/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/cuenta/pedido-detalle').then((m) => m.PedidoDetalle),
        title: 'Detalle del pedido | Akitukuymi',
      },
      {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('./features/cuenta/perfil').then((m) => m.Perfil),
        title: 'Mi perfil | Akitukuymi',
      },
    ],
  },

  // ── Panel de administración (solo rol admin) ──
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard').then((m) => m.Dashboard),
        title: 'Dashboard | Admin Akitukuymi',
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/admin-pedidos').then((m) => m.AdminPedidos),
        title: 'Pedidos | Admin Akitukuymi',
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/admin-productos').then((m) => m.AdminProductos),
        title: 'Productos | Admin Akitukuymi',
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/admin-categorias').then((m) => m.AdminCategorias),
        title: 'Categorías | Admin Akitukuymi',
      },
      {
        path: 'lanas',
        loadComponent: () => import('./features/admin/admin-lanas').then((m) => m.AdminLanas),
        title: 'Lanas | Admin Akitukuymi',
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/admin-usuarios').then((m) => m.AdminUsuarios),
        title: 'Usuarios | Admin Akitukuymi',
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
