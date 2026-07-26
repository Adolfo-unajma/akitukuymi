import { describe, expect, it } from 'vitest';
import {
  documentoValido,
  emailValido,
  esTipoDocumentoValido,
  evaluarPassword,
  fortalezaPassword,
  nombreValido,
  normalizarDocumento,
  normalizarEmail,
  normalizarNombre,
  normalizarTelefonoPe,
} from './validacion';

describe('normalizarEmail', () => {
  it('pasa a minúsculas y recorta espacios', () => {
    expect(normalizarEmail('  Maria@Ejemplo.COM ')).toBe('maria@ejemplo.com');
  });
  it('elimina caracteres invisibles (zero-width)', () => {
    const conZeroWidth = 'a​b@x.com';
    expect(normalizarEmail(conZeroWidth)).toBe('ab@x.com');
  });
});

describe('normalizarNombre', () => {
  it('colapsa espacios múltiples', () => {
    expect(normalizarNombre('  María   José  ')).toBe('María José');
  });
});

describe('nombreValido', () => {
  it('acepta nombres con tildes y guiones', () => {
    expect(nombreValido('María José')).toBe(true);
    expect(nombreValido('Jean-Pierre')).toBe(true);
    expect(nombreValido('Ñusta')).toBe(true);
  });
  it('rechaza números, símbolos y vacíos', () => {
    expect(nombreValido('Maria3')).toBe(false);
    expect(nombreValido('Maria!')).toBe(false);
    expect(nombreValido('A')).toBe(false);
    expect(nombreValido('')).toBe(false);
  });
  it('rechaza más de 6 palabras y textos muy largos', () => {
    expect(nombreValido('a b c d e f g')).toBe(false);
    expect(nombreValido('a'.repeat(61))).toBe(false);
  });
  it('rechaza intentos de inyección', () => {
    expect(nombreValido("' OR 1=1 --")).toBe(false);
    expect(nombreValido('"; DROP TABLE users; --')).toBe(false);
    expect(nombreValido('<script>alert(1)</script>')).toBe(false);
  });
});

describe('normalizarTelefonoPe', () => {
  it('normaliza a E.164 desde distintos formatos', () => {
    expect(normalizarTelefonoPe('977 000 000')).toBe('+51977000000');
    expect(normalizarTelefonoPe('+51 977-000-000')).toBe('+51977000000');
    expect(normalizarTelefonoPe('0051977000000')).toBe('+51977000000');
    expect(normalizarTelefonoPe('51977000000')).toBe('+51977000000');
  });
  it('rechaza números que no son móviles peruanos', () => {
    expect(normalizarTelefonoPe('12345678')).toBeNull(); // 8 dígitos
    expect(normalizarTelefonoPe('877000000')).toBeNull(); // no empieza en 9
    expect(normalizarTelefonoPe('9770000000')).toBeNull(); // 10 dígitos
    expect(normalizarTelefonoPe('abc')).toBeNull();
  });
});

describe('documentos', () => {
  it('reconoce los tipos válidos', () => {
    expect(esTipoDocumentoValido('DNI')).toBe(true);
    expect(esTipoDocumentoValido('CE')).toBe(true);
    expect(esTipoDocumentoValido('PASAPORTE')).toBe(true);
    expect(esTipoDocumentoValido('RUC')).toBe(false);
  });
  it('DNI: exactamente 8 dígitos', () => {
    expect(documentoValido('DNI', '12345678')).toBe(true);
    expect(documentoValido('DNI', '1234567')).toBe(false);
    expect(documentoValido('DNI', '123456789')).toBe(false);
    expect(documentoValido('DNI', 'ABCD1234')).toBe(false);
  });
  it('CE: 9–12 alfanuméricos', () => {
    expect(documentoValido('CE', normalizarDocumento('abc123456'))).toBe(true);
    expect(documentoValido('CE', '12345678')).toBe(false); // 8
    expect(documentoValido('CE', 'A234567890123')).toBe(false); // 13
  });
  it('PASAPORTE: 6–12 alfanuméricos', () => {
    expect(documentoValido('PASAPORTE', normalizarDocumento('x12345'))).toBe(true);
    expect(documentoValido('PASAPORTE', '12345')).toBe(false); // 5
  });
  it('normalizarDocumento pasa a mayúsculas y quita separadores', () => {
    expect(normalizarDocumento(' ab-12 34 ')).toBe('AB1234');
  });
});

describe('emailValido', () => {
  it('acepta correos válidos (cualquier dominio)', () => {
    expect(emailValido('maria@gmail.com')).toBe(true);
    expect(emailValido('a.b@empresa.pe')).toBe(true);
  });
  it('rechaza correos inválidos', () => {
    expect(emailValido('sinarroba.com')).toBe(false);
    expect(emailValido('a@b')).toBe(false);
    expect(emailValido('a b@x.com')).toBe(false);
    expect(emailValido('a@'.padEnd(260, 'x') + '.com')).toBe(false);
  });
});

describe('evaluarPassword', () => {
  it('acepta una contraseña razonable', () => {
    expect(evaluarPassword('tejido2024').valida).toBe(true);
  });
  it('rechaza por longitud', () => {
    expect(evaluarPassword('abc1').valida).toBe(false);
    expect(evaluarPassword('a1'.repeat(40)).valida).toBe(false); // > 64
  });
  it('exige letras y números', () => {
    expect(evaluarPassword('solotexto').valida).toBe(false);
    expect(evaluarPassword('12345678').valida).toBe(false);
  });
  it('rechaza contraseñas comunes', () => {
    expect(evaluarPassword('password1').valida).toBe(false);
    expect(evaluarPassword('qwerty123').valida).toBe(false);
  });
  it('rechaza si contiene el nombre o correo', () => {
    expect(evaluarPassword('maria1234', { nombre: 'Maria' }).valida).toBe(false);
    expect(evaluarPassword('carlos2024', { email: 'carlos@x.com' }).valida).toBe(false);
  });
});

describe('fortalezaPassword', () => {
  it('da 0 para vacío y sube con complejidad', () => {
    expect(fortalezaPassword('')).toBe(0);
    expect(fortalezaPassword('abcd1234')).toBeGreaterThanOrEqual(2);
    expect(fortalezaPassword('Abcd1234!xyz')).toBe(4);
  });
});
