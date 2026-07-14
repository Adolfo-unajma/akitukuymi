-- ═══════════════════════════════════════════════════════════════════════════
-- AKITUKUYMI — Datos iniciales (categorías, productos y lanas)
-- Ejecutar DESPUÉS de schema.sql: SQL Editor → New query → pegar → Run
-- Las imágenes apuntan a los archivos que ya están en public/img del frontend.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────── CATEGORÍAS ───────────────────────────
insert into public.categorias (nombre, slug, descripcion, imagen_url, orden, activo) values
  ('Chompas',       'chompas',       'Chompas tejidas a mano con lana suave y abrigadora',   '/img/productos/chompas.jpeg',    1, true),
  ('Gorros',        'gorros',        'Gorros andinos, con pompón y de todos los estilos',    '/img/productos/gorros.jpeg',     2, true),
  ('Amigurumis',    'amigurumis',    'Muñequitos tejidos a crochet, llenos de detalle',      '/img/productos/amigurumis.jpeg', 3, true),
  ('Mantas',        'mantas',        'Mantas y cobijas tejidas para tu hogar',               '/img/productos/mantas.jpeg',     4, true),
  ('Ramos tejidos', 'ramos-tejidos', 'Flores tejidas que duran para siempre',                '/img/ofertas/ramos.jpg',         5, true),
  ('Accesorios',    'accesorios',    'Llaveros, guantes, bufandas y más',                    '/img/productos/accesorio.jpeg',  6, true);

-- ─────────────────────────── PRODUCTOS ───────────────────────────
insert into public.productos
  (categoria_id, nombre, slug, descripcion, precio, precio_oferta, stock, imagen_url, destacado, activo)
values
  ((select id from public.categorias where slug = 'chompas'),
   'Chompa de lana clásica', 'chompa-lana-clasica',
   'Chompa tejida a mano con lana suave, ideal para el frío. Disponible en varias tallas y colores a pedido.',
   120, null, 8, '/img/productos/chompas.jpeg', true, true),

  ((select id from public.categorias where slug = 'chompas'),
   'Chompa infantil de colores', 'chompa-infantil-colores',
   'Chompa para niños con combinación de colores alegres, tejido firme y cómodo.',
   85, null, 5, '/img/productos/chompas.jpeg', false, true),

  ((select id from public.categorias where slug = 'gorros'),
   'Gorro andino con orejeras', 'gorro-andino-orejeras',
   'Gorro estilo chullo con orejeras y trenzas, abrigador y resistente.',
   35, null, 15, '/img/productos/gorros.jpeg', true, true),

  ((select id from public.categorias where slug = 'gorros'),
   'Gorro con pompón', 'gorro-pompon',
   'Gorro clásico con pompón, disponible en varios colores.',
   28, 22, 20, '/img/ofertas/gorros.png', false, true),

  ((select id from public.categorias where slug = 'amigurumis'),
   'Amigurumi llama', 'amigurumi-llama',
   'Llamita tejida a crochet con detalles bordados, perfecta para regalo.',
   45, null, 10, '/img/productos/amigurumis.jpeg', true, true),

  ((select id from public.categorias where slug = 'amigurumis'),
   'Amigurumi osito', 'amigurumi-osito',
   'Osito de peluche tejido a mano, suave y seguro para los más pequeños.',
   40, null, 12, '/img/productos/amigurumis.jpeg', false, true),

  ((select id from public.categorias where slug = 'mantas'),
   'Manta de lana trenzada', 'manta-lana-trenzada',
   'Manta grande con patrón trenzado, ideal para la sala o el dormitorio.',
   150, null, 4, '/img/productos/mantas.jpeg', true, true),

  ((select id from public.categorias where slug = 'mantas'),
   'Manta para bebé', 'manta-bebe',
   'Manta suave e hipoalergénica para bebé, tejido delicado.',
   95, null, 6, '/img/productos/mantas.jpeg', false, true),

  ((select id from public.categorias where slug = 'accesorios'),
   'Llaveros amigurumi', 'llaveros-amigurumi',
   'Llaveros tejidos con formas de animalitos y frutas. Precio por unidad.',
   15, 12, 30, '/img/ofertas/llaveros.jpg', false, true),

  ((select id from public.categorias where slug = 'ramos-tejidos'),
   'Ramo de flores tejidas', 'ramo-flores-tejidas',
   'Ramo de flores a crochet que nunca se marchitan. Personalizable en colores.',
   60, 50, 7, '/img/ofertas/ramos.jpg', true, true),

  ((select id from public.categorias where slug = 'ramos-tejidos'),
   'Ramo especial "Mamá"', 'ramo-especial-mama',
   'Ramo tejido edición especial con dedicatoria, el regalo perfecto para mamá.',
   75, null, 5, '/img/ofertas/ramos-mama.png', true, true),

  ((select id from public.categorias where slug = 'accesorios'),
   'Guantes de lana', 'guantes-lana',
   'Guantes tejidos abrigadores, disponibles para adultos y niños.',
   25, null, 18, '/img/productos/accesorio.jpeg', false, true);

-- ─────────────────────────── LANAS ───────────────────────────
insert into public.lanas (nombre, color, precio_unidad, precio_paquete, unidades_por_paquete, stock, activo) values
  ('Lana acrílica premium', 'Rojo',          4.50, 40, 10, 50, true),
  ('Lana acrílica premium', 'Azul marino',   4.50, 40, 10, 42, true),
  ('Lana bebé suave',       'Rosado pastel', 6.00, 55, 10, 30, true),
  ('Hilo de algodón',       'Blanco',        5.00, 45, 10, 25, true),
  ('Lana matizada',         'Multicolor',    7.00, 62, 10, 20, true),
  ('Lana chenilla',         'Beige',         8.50, 78, 10, 15, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO FINAL — Hacerte administrador:
-- 1. Regístrate primero en la web (o en Authentication → Users → Add user).
-- 2. Reemplaza el correo de abajo por el tuyo y ejecuta esta línea:
-- ═══════════════════════════════════════════════════════════════════════════

-- update public.perfiles set rol = 'admin' where email = 'TU-CORREO@AQUI.COM';
