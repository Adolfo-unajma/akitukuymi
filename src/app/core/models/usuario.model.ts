import { TipoDocumento } from '../validacion';

export type RolUsuario = 'cliente' | 'admin';

/** Perfil de usuario (tabla `perfiles` en Supabase, vinculada a auth.users) */
export interface Perfil {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string;
  telefono?: string;
  /** Tipo de documento de identidad. */
  tipo_documento?: TipoDocumento;
  /** Número de documento (columna `dni` en la BD, guarda DNI/CE/Pasaporte). */
  dni?: string;
  avatar_url?: string;
  rol: RolUsuario;
  creado_en?: string;
}
