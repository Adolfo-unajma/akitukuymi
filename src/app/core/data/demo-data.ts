import { Categoria, Lana, Perfil, Producto } from '../models';

/**
 * Datos de muestra para el MODO DEMO (mientras Supabase no está conectado).
 * Las imágenes provienen del catálogo real de la tienda.
 */

export const CATEGORIAS_DEMO: Categoria[] = [
  { id: 'cat-chompas', nombre: 'Chompas', slug: 'chompas', descripcion: 'Chompas tejidas a mano con lana suave y abrigadora', imagen_url: '/img/productos/chompas.jpeg', orden: 1, activo: true },
  { id: 'cat-gorros', nombre: 'Gorros', slug: 'gorros', descripcion: 'Gorros andinos, con pompón y de todos los estilos', imagen_url: '/img/productos/gorros.jpeg', orden: 2, activo: true },
  { id: 'cat-amigurumis', nombre: 'Amigurumis', slug: 'amigurumis', descripcion: 'Muñequitos tejidos a crochet, llenos de detalle', imagen_url: '/img/productos/amigurumis.jpeg', orden: 3, activo: true },
  { id: 'cat-mantas', nombre: 'Mantas', slug: 'mantas', descripcion: 'Mantas y cobijas tejidas para tu hogar', imagen_url: '/img/productos/mantas.jpeg', orden: 4, activo: true },
  { id: 'cat-ramos', nombre: 'Ramos tejidos', slug: 'ramos-tejidos', descripcion: 'Flores tejidas que duran para siempre', imagen_url: '/img/ofertas/ramos.jpg', orden: 5, activo: true },
  { id: 'cat-accesorios', nombre: 'Accesorios', slug: 'accesorios', descripcion: 'Llaveros, guantes, bufandas y más', imagen_url: '/img/productos/accesorio.jpeg', orden: 6, activo: true },
];

export const PRODUCTOS_DEMO: Producto[] = [
  { id: 'prod-01', categoria_id: 'cat-chompas', nombre: 'Chompa de lana clásica', slug: 'chompa-lana-clasica', descripcion: 'Chompa tejida a mano con lana suave, ideal para el frío. Disponible en varias tallas y colores a pedido.', precio: 120, stock: 8, imagen_url: '/img/productos/chompas.jpeg', destacado: true, activo: true },
  { id: 'prod-02', categoria_id: 'cat-chompas', nombre: 'Chompa infantil de colores', slug: 'chompa-infantil-colores', descripcion: 'Chompa para niños con combinación de colores alegres, tejido firme y cómodo.', precio: 85, stock: 5, imagen_url: '/img/productos/chompas.jpeg', destacado: false, activo: true },
  { id: 'prod-03', categoria_id: 'cat-gorros', nombre: 'Gorro andino con orejeras', slug: 'gorro-andino-orejeras', descripcion: 'Gorro estilo chullo con orejeras y trenzas, abrigador y resistente.', precio: 35, stock: 15, imagen_url: '/img/productos/gorros.jpeg', destacado: true, activo: true },
  { id: 'prod-04', categoria_id: 'cat-gorros', nombre: 'Gorro con pompón', slug: 'gorro-pompon', descripcion: 'Gorro clásico con pompón, disponible en varios colores.', precio: 28, precio_oferta: 22, stock: 20, imagen_url: '/img/ofertas/gorros.png', destacado: false, activo: true },
  { id: 'prod-05', categoria_id: 'cat-amigurumis', nombre: 'Amigurumi llama', slug: 'amigurumi-llama', descripcion: 'Llamita tejida a crochet con detalles bordados, perfecta para regalo.', precio: 45, stock: 10, imagen_url: '/img/productos/amigurumis.jpeg', destacado: true, activo: true },
  { id: 'prod-06', categoria_id: 'cat-amigurumis', nombre: 'Amigurumi osito', slug: 'amigurumi-osito', descripcion: 'Osito de peluche tejido a mano, suave y seguro para los más pequeños.', precio: 40, stock: 12, imagen_url: '/img/productos/amigurumis.jpeg', destacado: false, activo: true },
  { id: 'prod-07', categoria_id: 'cat-mantas', nombre: 'Manta de lana trenzada', slug: 'manta-lana-trenzada', descripcion: 'Manta grande con patrón trenzado, ideal para la sala o el dormitorio.', precio: 150, stock: 4, imagen_url: '/img/productos/mantas.jpeg', destacado: true, activo: true },
  { id: 'prod-08', categoria_id: 'cat-mantas', nombre: 'Manta para bebé', slug: 'manta-bebe', descripcion: 'Manta suave e hipoalergénica para bebé, tejido delicado.', precio: 95, stock: 6, imagen_url: '/img/productos/mantas.jpeg', destacado: false, activo: true },
  { id: 'prod-09', categoria_id: 'cat-accesorios', nombre: 'Llaveros amigurumi', slug: 'llaveros-amigurumi', descripcion: 'Llaveros tejidos con formas de animalitos y frutas. Precio por unidad.', precio: 15, precio_oferta: 12, stock: 30, imagen_url: '/img/ofertas/llaveros.jpg', destacado: false, activo: true },
  { id: 'prod-10', categoria_id: 'cat-ramos', nombre: 'Ramo de flores tejidas', slug: 'ramo-flores-tejidas', descripcion: 'Ramo de flores a crochet que nunca se marchitan. Personalizable en colores.', precio: 60, precio_oferta: 50, stock: 7, imagen_url: '/img/ofertas/ramos.jpg', destacado: true, activo: true },
  { id: 'prod-11', categoria_id: 'cat-ramos', nombre: 'Ramo especial "Mamá"', slug: 'ramo-especial-mama', descripcion: 'Ramo tejido edición especial con dedicatoria, el regalo perfecto para mamá.', precio: 75, stock: 5, imagen_url: '/img/ofertas/ramos-mama.png', destacado: true, activo: true },
  { id: 'prod-12', categoria_id: 'cat-accesorios', nombre: 'Guantes de lana', slug: 'guantes-lana', descripcion: 'Guantes tejidos abrigadores, disponibles para adultos y niños.', precio: 25, stock: 18, imagen_url: '/img/productos/accesorio.jpeg', destacado: false, activo: true },
];

export const LANAS_DEMO: Lana[] = [
  { id: 'lana-01', nombre: 'Lana acrílica premium', color: 'Rojo', precio_unidad: 4.5, precio_paquete: 40, unidades_por_paquete: 10, stock: 50, activo: true },
  { id: 'lana-02', nombre: 'Lana acrílica premium', color: 'Azul marino', precio_unidad: 4.5, precio_paquete: 40, unidades_por_paquete: 10, stock: 42, activo: true },
  { id: 'lana-03', nombre: 'Lana bebé suave', color: 'Rosado pastel', precio_unidad: 6, precio_paquete: 55, unidades_por_paquete: 10, stock: 30, activo: true },
  { id: 'lana-04', nombre: 'Hilo de algodón', color: 'Blanco', precio_unidad: 5, precio_paquete: 45, unidades_por_paquete: 10, stock: 25, activo: true },
  { id: 'lana-05', nombre: 'Lana matizada', color: 'Multicolor', precio_unidad: 7, precio_paquete: 62, unidades_por_paquete: 10, stock: 20, activo: true },
  { id: 'lana-06', nombre: 'Lana chenilla', color: 'Beige', precio_unidad: 8.5, precio_paquete: 78, unidades_por_paquete: 10, stock: 15, activo: true },
];

/** Usuarios del modo demo. La contraseña solo existe en demo, nunca en Supabase. */
export interface UsuarioDemo extends Perfil {
  password: string;
}

export const USUARIOS_DEMO: UsuarioDemo[] = [
  {
    id: 'user-admin',
    email: 'admin@akitukuymi.pe',
    nombre: 'Administrador',
    apellidos: 'Akitukuymi',
    telefono: '977477674',
    rol: 'admin',
    password: 'Admin123',
    creado_en: '2026-01-01T12:00:00Z',
  },
  {
    id: 'user-cliente',
    email: 'cliente@demo.pe',
    nombre: 'Cliente',
    apellidos: 'De Prueba',
    telefono: '999888777',
    rol: 'cliente',
    password: 'Cliente123',
    creado_en: '2026-01-02T12:00:00Z',
  },
];
