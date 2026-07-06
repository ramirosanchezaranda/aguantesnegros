// Cliente Supabase mínimo basado en `fetch` — sin dependencias.
// Habla directo con PostgREST (/rest/v1) y GoTrue (/auth/v1).
// Sólo se usa cuando están definidas las variables de entorno; si no,
// la app cae automáticamente al backend local (localStorage).

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
}

export function hasSupabase(): boolean {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey)
}

const TOKEN_KEY = 'agn-sb-token'

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* almacenamiento no disponible */
  }
}

/** Headers para PostgREST. Usa el token del admin logueado si existe. */
export function sbHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAccessToken() ?? supabaseConfig.anonKey ?? ''
  return {
    apikey: supabaseConfig.anonKey ?? '',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export function restUrl(path: string): string {
  return `${supabaseConfig.url}/rest/v1/${path}`
}

export function authUrl(path: string): string {
  return `${supabaseConfig.url}/auth/v1/${path}`
}
