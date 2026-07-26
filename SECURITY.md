# Seguridad — Registro e inicio de sesión

Documento de las medidas de seguridad del flujo de autenticación de Akitukuymi
(Angular + Supabase/PostgreSQL). Complementa el esquema en `.supabase/`.

> Arquitectura: la autenticación la gestiona **Supabase Auth** (`signUp`,
> `signInWithPassword`, OAuth Google). No hay backend propio ni Edge Functions.
> Existe además un **modo demo** (sin Supabase) para desarrollo local.

## Principios aplicados

- **Validar en cliente y servidor.** El frontend valida y normaliza; Supabase
  + las políticas RLS + los `CHECK` de la BD son la barrera real. El frontend
  nunca es la única defensa.
- **Normalizar antes de validar.** Toda entrada se limpia (`src/app/core/validacion.ts`):
  trim, colapso de espacios, minúsculas en correo, mayúsculas en documentos y
  eliminación de caracteres de control/invisibles Unicode.
- **Mínimo privilegio** vía RLS de Supabase.
- **Sin datos sensibles en logs.** No se hace `console.*` de contraseñas, tokens,
  JWT, DNI ni teléfonos (verificado en el árbol `src/`).
- **Consultas parametrizadas.** Todo pasa por el cliente de Supabase / RPC; no se
  concatena SQL a mano.

## Reglas de validación (regex)

Definidas en `src/app/core/validacion.ts` y probadas en `validacion.spec.ts`.

| Campo | Regla | Regex |
|---|---|---|
| Nombres / Apellidos | 2–60, letras (tildes/ñ), espacios y guiones, máx. 6 palabras | `^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ -][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,5}$` |
| DNI | 8 dígitos | `^\d{8}$` |
| CE | 9–12 alfanuméricos (mayúsculas) | `^[A-Z0-9]{9,12}$` |
| Pasaporte | 6–12 alfanuméricos (mayúsculas) | `^[A-Z0-9]{6,12}$` |
| Teléfono (PE) | móvil de 9 dígitos que empieza en 9, normalizado a E.164 | `^\+519\d{8}$` |
| Correo | ≤254, formato válido, minúsculas | `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` |

### Contraseña (política **moderada**)

- 8–64 caracteres, al menos **una letra y un número**.
- Rechaza contraseñas comunes (lista local) y las que contienen el nombre,
  apellido o correo del usuario.
- Medidor de fortaleza 0–4 en el registro (sin dependencias pesadas tipo zxcvbn).
- **Pendiente en el Dashboard de Supabase:** fijar longitud mínima (≥ 8) y activar
  *leaked password protection*. Supabase valida la contraseña del lado del servidor
  según esa configuración; el frontend por sí solo no puede imponerla.

## Rate limiting de login

Implementado **server-side** en `.supabase/seguridad-auth.sql`:

- Tabla `intentos_login` (RLS activo, **sin** políticas → inaccesible directamente
  desde el cliente).
- `verificar_bloqueo_login(email)` y `registrar_intento_login(email, exito)`,
  funciones `SECURITY DEFINER` ejecutables por `anon`.
- Límite: **5 intentos fallidos por correo en 15 min → bloqueo de 15 min.**
- El cliente (`AuthService.login`) consulta el bloqueo antes de intentar y registra
  el resultado después. Si el RPC aún no está desplegado, **falla-abierto** (no
  bloquea) para no dejar fuera a los usuarios; la protección se activa al aplicar
  el SQL.

**Limitación conocida:** la clave es el **correo**, no la IP. Dentro de PostgREST
la IP del cliente no llega de forma fiable (pooling). El rate limiting por IP lo
aporta la capa integrada de **Supabase Auth** (mantener sus límites activos). Para
límite por IP propio haría falta una Edge Function que reenvíe la IP real.

## Mensajes y fuga de información

- Login usa un **mensaje único**: *"Correo o contraseña incorrectos."* No revela si
  el correo existe.
- El correo se normaliza (minúsculas + trim) antes de autenticar.
- Se exige **verificación de correo** antes de activar la cuenta (config. de Supabase).

## Políticas RLS (ya existentes en `.supabase/schema.sql`)

- `perfiles: ver propio o admin` → un usuario solo lee su propio perfil.
- `perfiles: editar propio o admin` → solo actualiza su propio perfil.
- Trigger `perfiles_proteger_rol` → nadie se auto-asigna `admin`.
- Operaciones administrativas: función `es_admin()` / rol `service_role`.
- El resto de tablas (pedidos, direcciones, etc.) restringidas al dueño o admin.

## XSS / CSRF / tokens

- **XSS:** Angular escapa las interpolaciones por defecto. No se usa `innerHTML`
  con contenido de usuario en el flujo de auth.
- **CSRF:** no aplica el patrón clásico de cookies — Supabase usa *bearer tokens*,
  no cookies de sesión, así que no hay envío automático de credenciales cross-site.
- **Tokens:** el SDK de Supabase persiste la sesión en `localStorage` del navegador.
  Riesgo aceptado y documentado: es el comportamiento por defecto del SDK; se mitiga
  con la política de XSS. No se guardan tokens manualmente ni se registran en logs.

## Pruebas

`src/app/core/validacion.spec.ts` (vitest) cubre:

- Nombres válidos/ inválidos e intentos de inyección (`' OR 1=1 --`, `DROP TABLE`,
  `<script>`) → rechazados por los validadores.
- DNI / CE / Pasaporte inválidos.
- Teléfono no-móvil peruano.
- Contraseñas débiles / comunes / que contienen datos personales.
- Correos inválidos y normalización (incluye caracteres invisibles).

Ejecutar: `pnpm test --watch=false` · Compilar: `pnpm build`.

## Pendiente / recomendado

- Aplicar `.supabase/seguridad-auth.sql` (requiere visto bueno) para activar la
  columna `tipo_documento` y el rate limiting.
- En el Dashboard de Supabase: confirmación de correo, longitud mínima de
  contraseña y *leaked password protection*.
- (Opcional) Edge Function para rate limiting por IP real.
