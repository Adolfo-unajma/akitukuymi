/**
 * Validación y normalización de entradas de autenticación (registro / login).
 *
 * Reglas pensadas para Perú. Todas las funciones son puras y se prueban en
 * `validacion.spec.ts`. La misma normalización debe aplicarse antes de enviar
 * datos a Supabase; nunca se confía solo en el frontend (ver SECURITY.md).
 */

// ─────────────────────────── Normalización ───────────────────────────

/**
 * Quita caracteres de control/invisibles Unicode que se cuelan al pegar texto:
 * controles C0/C1, zero-width (U+200B–U+200D), BOM (U+FEFF) y separadores de
 * línea/párrafo (U+2028/U+2029). Conserva \t \n \r (los colapsa normalizarTexto).
 */
function quitarInvisibles(valor: string): string {
  let salida = '';
  for (const ch of valor) {
    const c = ch.codePointAt(0)!;
    const invisible =
      (c <= 0x08) || // C0 antes de \t
      (c >= 0x0e && c <= 0x1f) || // C0 después de \r
      c === 0x7f || // DEL
      (c >= 0x80 && c <= 0x9f) || // C1
      (c >= 0x200b && c <= 0x200d) || // zero-width
      c === 0x2028 || c === 0x2029 || // separadores línea/párrafo
      c === 0xfeff; // BOM / zero-width no-break space
    if (!invisible) salida += ch;
  }
  return salida;
}

/** trim + colapsa espacios múltiples + quita invisibles. */
export function normalizarTexto(valor: string): string {
  return quitarInvisibles(valor).replace(/\s+/g, ' ').trim();
}

/** Normaliza un nombre o apellido (texto limpio, sin cambiar mayúsculas). */
export function normalizarNombre(valor: string): string {
  return normalizarTexto(valor);
}

/** Correo en minúsculas, sin espacios ni invisibles. */
export function normalizarEmail(valor: string): string {
  return quitarInvisibles(valor).trim().toLowerCase();
}

/**
 * Normaliza un teléfono peruano a formato E.164 (`+519XXXXXXXX`).
 * Acepta entradas con espacios, guiones, `+51`, `0051` o sin prefijo.
 * Devuelve `null` si no corresponde a un móvil peruano válido.
 */
export function normalizarTelefonoPe(valor: string): string | null {
  let soloDigitos = quitarInvisibles(valor).replace(/[^\d]/g, '');
  // Quita prefijos internacionales comunes de Perú.
  if (soloDigitos.startsWith('0051')) soloDigitos = soloDigitos.slice(4);
  else if (soloDigitos.startsWith('51') && soloDigitos.length === 11) soloDigitos = soloDigitos.slice(2);
  // Debe quedar un móvil de 9 dígitos que empieza en 9.
  return /^9\d{8}$/.test(soloDigitos) ? `+51${soloDigitos}` : null;
}

// ─────────────────────────── Documentos ───────────────────────────

export type TipoDocumento = 'DNI' | 'CE' | 'PASAPORTE';

export const TIPOS_DOCUMENTO: readonly TipoDocumento[] = ['DNI', 'CE', 'PASAPORTE'];

export const ETIQUETA_DOCUMENTO: Record<TipoDocumento, string> = {
  DNI: 'DNI',
  CE: 'Carné de extranjería',
  PASAPORTE: 'Pasaporte',
};

const REGEX_DOCUMENTO: Record<TipoDocumento, RegExp> = {
  DNI: /^\d{8}$/,
  CE: /^[A-Z0-9]{9,12}$/,
  PASAPORTE: /^[A-Z0-9]{6,12}$/,
};

/** Normaliza el número de documento (mayúsculas y sin separadores). */
export function normalizarDocumento(valor: string): string {
  return quitarInvisibles(valor).replace(/[\s-]/g, '').toUpperCase();
}

export function esTipoDocumentoValido(tipo: string): tipo is TipoDocumento {
  return (TIPOS_DOCUMENTO as readonly string[]).includes(tipo);
}

/** Valida el número ya normalizado contra las reglas del tipo indicado. */
export function documentoValido(tipo: TipoDocumento, numero: string): boolean {
  return REGEX_DOCUMENTO[tipo].test(numero);
}

// ─────────────────────────── Nombres ───────────────────────────

/**
 * Letras (con tildes y ñ) separadas por espacio o guion, hasta 6 palabras.
 * Rechaza números y símbolos.
 */
export const REGEX_NOMBRE =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ -][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,5}$/;

export function nombreValido(valor: string): boolean {
  const limpio = normalizarNombre(valor);
  return limpio.length >= 2 && limpio.length <= 60 && REGEX_NOMBRE.test(limpio);
}

// ─────────────────────────── Correo ───────────────────────────

// Validación pragmática de correo (RFC-friendly, sin permitir espacios).
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(valor: string): boolean {
  const limpio = normalizarEmail(valor);
  return limpio.length <= 254 && REGEX_EMAIL.test(limpio);
}

// ─────────────────────────── Contraseña ───────────────────────────

export interface ContextoPassword {
  nombre?: string;
  apellidos?: string;
  email?: string;
}

export interface ResultadoPassword {
  valida: boolean;
  /** Motivo del rechazo (para mostrar al usuario). */
  error?: string;
  /** Fortaleza estimada 0–4 para el medidor visual. */
  fortaleza: number;
}

// Contraseñas demasiado comunes (bloqueo básico, sin dependencias pesadas).
const COMUNES = new Set([
  'password', 'contrasena', 'contraseña', '12345678', '123456789', '1234567890',
  'qwerty123', 'password1', 'admin123', 'iloveyou', 'akitukuymi', 'peru2024',
  'peru2025', '123456789a', 'abcd1234', 'qwertyuiop',
]);

/**
 * Política **moderada** para una tienda: 8–64 caracteres, al menos una letra y
 * un número, no puede contener el nombre/apellido/correo del usuario ni estar
 * en la lista de contraseñas comunes. Devuelve también una fortaleza 0–4.
 */
export function evaluarPassword(pass: string, ctx: ContextoPassword = {}): ResultadoPassword {
  const fortaleza = fortalezaPassword(pass);

  if (pass.length < 8) return { valida: false, error: 'Usa al menos 8 caracteres', fortaleza };
  if (pass.length > 64) return { valida: false, error: 'Máximo 64 caracteres', fortaleza };
  if (!/[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ]/.test(pass) || !/\d/.test(pass)) {
    return { valida: false, error: 'Combina letras y números', fortaleza };
  }
  if (COMUNES.has(pass.toLowerCase())) {
    return { valida: false, error: 'Esa contraseña es muy común, elige otra', fortaleza };
  }

  const minuscula = pass.toLowerCase();
  const contiene = (dato?: string): boolean => {
    if (!dato) return false;
    const parte = dato.split('@')[0];
    return parte.length >= 3 && minuscula.includes(parte.toLowerCase());
  };
  if (contiene(ctx.nombre) || contiene(ctx.apellidos) || contiene(ctx.email)) {
    return { valida: false, error: 'No uses tu nombre o correo en la contraseña', fortaleza };
  }

  return { valida: true, fortaleza };
}

/** Estimación ligera de fortaleza (0–4) para el medidor visual. */
export function fortalezaPassword(pass: string): number {
  if (!pass) return 0;
  let puntos = 0;
  if (pass.length >= 8) puntos++;
  if (pass.length >= 12) puntos++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) puntos++;
  if (/\d/.test(pass)) puntos++;
  if (/[^A-Za-z0-9]/.test(pass)) puntos++;
  return Math.min(4, puntos);
}
