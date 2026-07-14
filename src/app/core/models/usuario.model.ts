export type RolUsuario = 'cliente' | 'admin';

/** Perfil de usuario (tabla `perfiles` en Supabase, vinculada a auth.users) */
export interface Perfil {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string;
  telefono?: string;
  dni?: string;
  avatar_url?: string;
  rol: RolUsuario;
  creado_en?: string;
}
