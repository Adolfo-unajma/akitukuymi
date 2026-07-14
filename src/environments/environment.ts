/**
 * Configuración global de la aplicación.
 *
 * SUPABASE: cuando crees el proyecto en Supabase, copia aquí la URL y la
 * llave anónima (Dashboard → Settings → API). Mientras estén vacías, la app
 * funciona en MODO DEMO con datos de muestra guardados en el navegador.
 */
export const environment = {
  production: false,
  appName: 'Akitukuymi',

  supabase: {
    url: 'https://zrbiyzcyfvsaagffvtpy.supabase.co',
    anonKey: 'sb_publishable_q6I_G5r3co9c9aH4bwej3A_FmCbzuci',
  },

  /** Webhook del flujo n8n para el chatbot. Vacío = respuestas demo. */
  n8n: {
    chatWebhookUrl: 'https://adolfolb.app.n8n.cloud/webhook/daccb9a5-8fb7-4340-aa7f-de9a0bae8f77/chat',
  },

  contacto: {
    whatsapp: '51977477674',
    email: 'adilssondiaz557@gmail.com',
    ubicacion: 'Jr. Huáscar S/N, Pacucha, Andahuaylas — Apurímac',
    instagram: 'https://www.instagram.com/aki_tukuymi',
    facebook: 'https://www.facebook.com/share/1CnTg868Xr/',
    tiktok: 'https://www.tiktok.com/@aki_tukuymi',
  },

  pagos: {
    metodo: 'Yape',
    qrUrl: '/img/comprobante/qr.jpeg',
    titular: 'Akitukuymi',
  },
};
