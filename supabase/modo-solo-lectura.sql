-- ═══════════════════════════════════════════════════════════════════════════
-- AKITUKUYMI — Modo demostración (SOLO LECTURA) a nivel de base de datos
--
-- Esta es la protección REAL: aunque alguien tenga la cuenta admin y sepa
-- programar, no podrá crear, editar ni borrar nada. Las lecturas (catálogo,
-- lanas, chatbot, ver pedidos) siguen funcionando con normalidad.
--
-- Cómo funciona: se quitan los permisos de escritura (INSERT/UPDATE/DELETE)
-- a los roles con los que la API de Supabase atiende a la web (anon = visitante,
-- authenticated = usuario logueado). El login sigue funcionando porque vive en
-- otro esquema (auth), que no se toca.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────── ACTIVAR modo solo lectura ───────────────────────
-- Ejecutar en: Supabase → SQL Editor → New query → pegar esta sección → Run

revoke insert, update, delete on all tables in schema public from anon, authenticated;

-- La función que descuenta stock corre con privilegios elevados; se bloquea
-- también para que no se pueda invocar directamente.
revoke execute on function public.descontar_stock(uuid, integer) from anon, authenticated;

-- (Opcional) Deja constancia visible del modo en la base:
comment on schema public is 'MODO DEMOSTRACION (solo lectura) activo';


-- ═══════════════════════════════════════════════════════════════════════════
-- ─────────────────────── REACTIVAR la edición ───────────────────────
-- Cuando quieras volver a administrar de verdad, pon `soloLectura: false` en
-- src/environments/environment.ts, redepliega, y ejecuta ESTA sección:
--
--   grant insert, update, delete on all tables in schema public to authenticated;
--   grant insert on public.pedidos, public.items_pedido to authenticated;
--   grant execute on function public.descontar_stock(uuid, integer) to authenticated;
--   comment on schema public is null;
--
-- (Nota: a `anon` no se le devuelven permisos de escritura porque nunca los
--  necesitó; RLS ya lo limitaba. Solo `authenticated` escribe, según su rol.)
-- ═══════════════════════════════════════════════════════════════════════════
