import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Acceso único al cliente de Supabase.
 * Si no hay llaves configuradas en `environment.ts`, `habilitado` es false y
 * los servicios trabajan en modo demo (datos locales de muestra).
 */
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly enNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  readonly habilitado = !!(environment.supabase.url && environment.supabase.anonKey);

  private _client: SupabaseClient | null = null;

  get client(): SupabaseClient {
    if (!this._client) {
      this._client = createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: {
          persistSession: this.enNavegador,
          autoRefreshToken: this.enNavegador,
        },
      });
    }
    return this._client;
  }
}
