-- ═══════════════════════════════════════════════════════════════════════════
-- AKITUKUYMI — Esquema de base de datos para Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → pegar todo → Run
-- (Ejecutar UNA sola vez. Después ejecutar seed.sql para los datos iniciales)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────── TABLAS ───────────────────────────────

-- Perfiles: extiende auth.users (se crea automáticamente al registrarse)
create table public.perfiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  nombre      text not null default '',
  apellidos   text,
  telefono    text,
  dni         text,
  avatar_url  text,
  rol         text not null default 'cliente' check (rol in ('cliente', 'admin')),
  creado_en   timestamptz not null default now()
);

create table public.categorias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text unique,
  descripcion text,
  imagen_url  text,
  orden       integer not null default 0,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

create table public.productos (
  id            uuid primary key default gen_random_uuid(),
  categoria_id  uuid references public.categorias (id) on delete set null,
  nombre        text not null,
  slug          text,
  descripcion   text,
  precio        numeric(10,2) not null check (precio >= 0),
  precio_oferta numeric(10,2) check (precio_oferta is null or precio_oferta >= 0),
  stock         integer not null default 0 check (stock >= 0),
  imagen_url    text,
  destacado     boolean not null default false,
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

create table public.lanas (
  id                   uuid primary key default gen_random_uuid(),
  nombre               text not null,
  color                text,
  precio_unidad        numeric(10,2) not null default 0,
  precio_paquete       numeric(10,2) not null default 0,
  unidades_por_paquete integer not null default 10,
  stock                integer not null default 0,
  activo               boolean not null default true,
  creado_en            timestamptz not null default now()
);

create table public.direcciones_envio (
  id                uuid primary key default gen_random_uuid(),
  usuario_id        uuid not null references public.perfiles (id) on delete cascade,
  nombre_completo   text not null,
  telefono          text not null,
  direccion         text not null,
  distrito          text not null,
  ciudad            text not null,
  referencia        text,
  es_predeterminada boolean not null default false,
  creado_en         timestamptz not null default now()
);

create table public.pedidos (
  id               uuid primary key default gen_random_uuid(),
  usuario_id       uuid not null references public.perfiles (id) on delete cascade,
  numero_pedido    text not null unique,
  estado           text not null default 'pago_pendiente' check (estado in
    ('pago_pendiente','pago_subido','confirmado','empaquetado','en_camino','entregado','cancelado')),
  monto_total      numeric(10,2) not null default 0,
  metodo_pago      text not null default 'yape',
  numero_operacion text,
  comprobante_url  text,
  notas            text,
  direccion_envio  jsonb not null,   -- copia congelada de la dirección al comprar
  creado_en        timestamptz not null default now()
);

create table public.items_pedido (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos (id) on delete cascade,
  producto_id     uuid references public.productos (id) on delete set null,
  nombre_producto text not null,     -- congelado al momento de la compra
  imagen_url      text,
  cantidad        integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null,
  subtotal        numeric(10,2) not null
);

create table public.historial_estados (
  id        uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos (id) on delete cascade,
  estado    text not null,
  notas     text,
  creado_en timestamptz not null default now()
);

-- Índices para las consultas frecuentes
create index idx_productos_categoria on public.productos (categoria_id);
create index idx_productos_activo on public.productos (activo);
create index idx_direcciones_usuario on public.direcciones_envio (usuario_id);
create index idx_pedidos_usuario on public.pedidos (usuario_id);
create index idx_pedidos_estado on public.pedidos (estado);
create index idx_items_pedido on public.items_pedido (pedido_id);
create index idx_historial_pedido on public.historial_estados (pedido_id);

-- ─────────────────────────── FUNCIONES Y TRIGGERS ───────────────────────────

-- ¿El usuario actual es admin? (security definer para usarla dentro de las políticas RLS)
create or replace function public.es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from perfiles where id = auth.uid() and rol = 'admin');
$$;

-- Crea el perfil automáticamente cuando alguien se registra (email o Google)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, email, nombre, apellidos, telefono, dni, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'nombre',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'apellidos',
    new.raw_user_meta_data->>'telefono',
    new.raw_user_meta_data->>'dni',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Nadie puede auto-asignarse admin (solo otro admin, o desde el SQL Editor)
create or replace function public.proteger_cambio_rol()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- auth.uid() es null cuando se ejecuta desde el SQL Editor / service role: se permite
  if new.rol is distinct from old.rol
     and auth.uid() is not null
     and not public.es_admin() then
    raise exception 'Solo un administrador puede cambiar roles';
  end if;
  return new;
end;
$$;

create trigger perfiles_proteger_rol
  before update on public.perfiles
  for each row execute function public.proteger_cambio_rol();

-- Genera el slug automáticamente si no se envía
create or replace function public.generar_slug()
returns trigger
language plpgsql
as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := trim(both '-' from lower(regexp_replace(new.nombre, '[^a-zA-Z0-9]+', '-', 'g')));
  end if;
  return new;
end;
$$;

create trigger categorias_slug before insert or update on public.categorias
  for each row execute function public.generar_slug();
create trigger productos_slug before insert or update on public.productos
  for each row execute function public.generar_slug();

-- Descuenta stock al crear un pedido (la llama el frontend)
create or replace function public.descontar_stock(p_producto_id uuid, p_cantidad integer)
returns void
language sql security definer set search_path = public
as $$
  update productos
  set stock = greatest(0, stock - p_cantidad)
  where id = p_producto_id;
$$;

grant execute on function public.descontar_stock(uuid, integer) to authenticated;

-- Consulta pública y segura del estado de un pedido (para el chatbot de n8n).
-- Devuelve SOLO datos no sensibles; el número de pedido actúa como "token".
create or replace function public.consultar_pedido_publico(p_numero text)
returns table (numero_pedido text, estado text, monto_total numeric, creado_en timestamptz)
language sql stable security definer set search_path = public
as $$
  select numero_pedido, estado, monto_total, creado_en
  from pedidos
  where upper(numero_pedido) = upper(trim(p_numero));
$$;

grant execute on function public.consultar_pedido_publico(text) to anon, authenticated;

-- ─────────────────────── SEGURIDAD (Row Level Security) ───────────────────────

alter table public.perfiles enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.lanas enable row level security;
alter table public.direcciones_envio enable row level security;
alter table public.pedidos enable row level security;
alter table public.items_pedido enable row level security;
alter table public.historial_estados enable row level security;

-- PERFILES: cada quien ve/edita el suyo; el admin ve y edita todos
create policy "perfiles: ver propio o admin" on public.perfiles
  for select using (auth.uid() = id or public.es_admin());
create policy "perfiles: editar propio o admin" on public.perfiles
  for update using (auth.uid() = id or public.es_admin());

-- CATÁLOGO: lectura pública de lo activo; el admin gestiona todo
create policy "categorias: lectura publica" on public.categorias
  for select using (activo = true or public.es_admin());
create policy "categorias: gestion admin" on public.categorias
  for all using (public.es_admin()) with check (public.es_admin());

create policy "productos: lectura publica" on public.productos
  for select using (activo = true or public.es_admin());
create policy "productos: gestion admin" on public.productos
  for all using (public.es_admin()) with check (public.es_admin());

create policy "lanas: lectura publica" on public.lanas
  for select using (activo = true or public.es_admin());
create policy "lanas: gestion admin" on public.lanas
  for all using (public.es_admin()) with check (public.es_admin());

-- DIRECCIONES: cada usuario gestiona las suyas; el admin puede verlas
create policy "direcciones: gestion propia" on public.direcciones_envio
  for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
create policy "direcciones: ver admin" on public.direcciones_envio
  for select using (public.es_admin());

-- PEDIDOS: el cliente crea y ve los suyos (y sube comprobante / cancela);
-- el admin ve y actualiza todos
create policy "pedidos: ver propio o admin" on public.pedidos
  for select using (auth.uid() = usuario_id or public.es_admin());
create policy "pedidos: crear propio" on public.pedidos
  for insert with check (auth.uid() = usuario_id);
create policy "pedidos: actualizar propio o admin" on public.pedidos
  for update using (auth.uid() = usuario_id or public.es_admin());

-- ITEMS: van atados al pedido del dueño
create policy "items: ver del propio pedido o admin" on public.items_pedido
  for select using (
    public.es_admin() or exists (
      select 1 from pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()
    )
  );
create policy "items: crear en propio pedido" on public.items_pedido
  for insert with check (
    exists (select 1 from pedidos p where p.id = pedido_id and p.usuario_id = auth.uid())
  );

-- HISTORIAL: visible para el dueño del pedido y el admin
create policy "historial: ver del propio pedido o admin" on public.historial_estados
  for select using (
    public.es_admin() or exists (
      select 1 from pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()
    )
  );
create policy "historial: crear dueno o admin" on public.historial_estados
  for insert with check (
    public.es_admin() or exists (
      select 1 from pedidos p where p.id = pedido_id and p.usuario_id = auth.uid()
    )
  );

-- ─────────────────────────── STORAGE (imágenes) ───────────────────────────

insert into storage.buckets (id, name, public)
values ('imagenes', 'imagenes', true), ('comprobantes', 'comprobantes', true)
on conflict (id) do nothing;

-- Imágenes de productos/categorías: todos leen, solo el admin sube
create policy "storage imagenes: lectura publica" on storage.objects
  for select using (bucket_id = 'imagenes');
create policy "storage imagenes: subida admin" on storage.objects
  for insert with check (bucket_id = 'imagenes' and public.es_admin());
create policy "storage imagenes: gestion admin" on storage.objects
  for update using (bucket_id = 'imagenes' and public.es_admin());
create policy "storage imagenes: borrado admin" on storage.objects
  for delete using (bucket_id = 'imagenes' and public.es_admin());

-- Comprobantes de pago: cualquier usuario logueado sube el suyo
create policy "storage comprobantes: lectura publica" on storage.objects
  for select using (bucket_id = 'comprobantes');
create policy "storage comprobantes: subida clientes" on storage.objects
  for insert with check (bucket_id = 'comprobantes' and auth.role() = 'authenticated');
create policy "storage comprobantes: borrado admin" on storage.objects
  for delete using (bucket_id = 'comprobantes' and public.es_admin());
