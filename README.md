# Akitukuymi — Tienda de tejidos artesanales

Tienda artesanal en línea **Akitukuymi**: chompas, gorros,
amigurumis, mantas, ramos tejidos y venta de lanas. Migración del proyecto original
(Angular + Laravel + Firebase + Cloudinary) a un stack moderno.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22 (standalone + signals + zoneless) con SSR/prerender |
| Estilos | Tailwind CSS 4 (tema propio: paleta *clay/cream/andes*, fuentes Fraunces + Outfit autoalojadas) |
| Iconos | [Lucide](https://lucide.dev) (`lucide-angular`) + [Tabler](https://tabler.io/icons) y [Heroicons](https://heroicons.com) vía `@ng-icons` (marcas y complementos) |
| Backend | Supabase (Auth + Postgres + Storage) — *pendiente de conectar* |
| Chatbot | n8n + DeepSeek vía webhook — *pendiente de conectar* |
| Gestor de paquetes | pnpm |

## Comandos

```bash
pnpm install       # instalar dependencias
pnpm start         # servidor de desarrollo → http://localhost:4200
pnpm build         # build de producción (SSR + prerender)
pnpm serve:ssr:akitukuymi   # servir el build → http://localhost:4000
```

## Modo demo (sin Supabase)

Mientras `src/environments/environment.ts` no tenga llaves de Supabase, la app
funciona con **datos de muestra** persistidos en localStorage:

- **Admin:** `admin@akitukuymi.pe` / `Admin123`
- **Cliente:** `cliente@demo.pe` / `Cliente123`

## Conectar Supabase (cuando esté listo)

1. Crear el proyecto en [supabase.com](https://supabase.com) y ejecutar el archivo SQL
   del esquema (se genera al aprobar el frontend).
2. Copiar la URL y la anon key en `src/environments/environment.ts` → `supabase`.
3. Crear los buckets de Storage: `imagenes` (público) y `comprobantes` (público).
4. Activar el proveedor Google en Authentication → Providers.

## Conectar el chatbot (n8n + DeepSeek)

Configurar `environment.n8n.chatWebhookUrl` con el webhook del flujo de n8n
(Chat Trigger). El widget envía `{ sessionId, action: 'sendMessage', chatInput }`
y espera `{ output }` como respuesta.

## Estructura

```
src/app/
├── core/            # modelos, servicios, guards, datos demo, iconos
│   ├── models/      # interfaces TS (producto, pedido, perfil, …)
│   ├── services/    # Supabase + lógica de negocio (con modo demo)
│   └── guards/      # authGuard, adminGuard, guestGuard
├── shared/          # componentes reutilizables (navbar, footer, cards, toasts…)
└── features/        # páginas lazy-loaded
    ├── home / catalogo / carrito / checkout / auth / cuenta
    └── admin/       # panel: dashboard, pedidos, productos, categorías, lanas, usuarios
```

## Flujo de compra

Catálogo → Carrito → Checkout (dirección → **pago con QR de Yape** + subida de
comprobante) → El admin verifica el pago y avanza el pedido:
`pago_pendiente → pago_subido → confirmado → empaquetado → en_camino → entregado`.
