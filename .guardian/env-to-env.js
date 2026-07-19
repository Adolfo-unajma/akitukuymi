#!/usr/bin/env node
/**
 * Genera src/environments/environment.ts desde .env
 * Ejecutar: node .guardian/env-to-env.js
 * Se ejecuta automáticamente en postinstall si existe .env
 */
const fs = require('fs');
const path = require('path');

const ENV_FILE = path.resolve(__dirname, '..', '.env');
const OUT_FILE = path.resolve(__dirname, '..', 'src', 'environments', 'environment.ts');

function load(f) {
  if (!fs.existsSync(f)) return {};
  const out = {};
  fs.readFileSync(f, 'utf8').split('\n').forEach((l) => {
    const m = l.match(/^\s*([\w_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
  return out;
}

const env = load(ENV_FILE);

const content = `/**
 * ARCHIVO GENERADO — No editar a mano.
 * Los valores provienen de .env (ver .env.example).
 * Regenerar con: node .guardian/env-to-env.js
 */
export const environment = {
  production: false,
  appName: 'Akitukuymi',
  soloLectura: false,
  supabase: {
    url: '${env.SUPABASE_URL || ''}',
    anonKey: '${env.SUPABASE_ANON_KEY || ''}',
  },
  n8n: {
    chatWebhookUrl: '${env.N8N_CHAT_WEBHOOK_URL || ''}',
  },
  contacto: {
    whatsapp: '${env.CONTACTO_WHATSAPP || ''}',
    email: '${env.CONTACTO_EMAIL || ''}',
    ubicacion: '${env.CONTACTO_UBICACION || ''}',
    instagram: '${env.CONTACTO_INSTAGRAM || ''}',
    facebook: '${env.CONTACTO_FACEBOOK || ''}',
    tiktok: '${env.CONTACTO_TIKTOK || ''}',
  },
  pagos: {
    metodo: 'Yape',
    qrUrl: '/img/comprobante/qr.jpeg',
    titular: 'Akitukuymi',
  },
};\n`;

fs.writeFileSync(OUT_FILE, content);
if (env.SUPABASE_URL) console.log('  [env-to-env] environment.ts generado desde .env');
