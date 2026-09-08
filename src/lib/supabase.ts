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

const ACCESS_KEY = 'agn-sb-token'
const REFRESH_KEY = 'agn-sb-refresh'
const EXPIRES_KEY = 'agn-sb-expires'
/** Sesión visible del admin; se limpia junto con los tokens. */
export const SESSION_KEY = 'agn-admin-session'

/** Se renueva un minuto antes del vencimiento real. */
const REFRESH_SKEW_MS = 60_000

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* almacenamiento no disponible */
  }
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  user?: { email?: string }
}

/** Guarda el token de acceso junto con el de refresco y su vencimiento. */
export function saveSession(token: TokenResponse): void {
  write(ACCESS_KEY, token.access_token)
  write(REFRESH_KEY, token.refresh_token ?? null)
  write(EXPIRES_KEY, token.expires_in ? String(Date.now() + token.expires_in * 1000) : null)
}

export function clearSession(): void {
  write(ACCESS_KEY, null)
  write(REFRESH_KEY, null)
  write(EXPIRES_KEY, null)
  write(SESSION_KEY, null)
}

export function getAccessToken(): string | null {
  return read(ACCESS_KEY)
}

let refreshing: Promise<string | null> | null = null

/** Canjea el refresh token por uno nuevo. Comparte la promesa entre llamadas
 *  simultáneas para no pedir varios refrescos a la vez. */
function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing
  const refreshToken = read(REFRESH_KEY)
  if (!refreshToken) {
    clearSession()
    return Promise.resolve(null)
  }
  refreshing = (async () => {
    try {
      const res = await fetch(authUrl('token?grant_type=refresh_token'), {
        method: 'POST',
        headers: { apikey: supabaseConfig.anonKey ?? '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!res.ok) {
        // El refresh token ya no sirve: hay que volver a iniciar sesión.
        clearSession()
        return null
      }
      const data = (await res.json()) as TokenResponse
      saveSession(data)
      return data.access_token
    } catch {
      return null
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

/** Token de acceso válido, renovándolo si está vencido o por vencer. */
export async function freshAccessToken(): Promise<string | null> {
  const token = read(ACCESS_KEY)
  if (!token) return null
  const expiresAt = Number(read(EXPIRES_KEY) ?? 0)
  if (expiresAt && Date.now() > expiresAt - REFRESH_SKEW_MS) return refreshAccessToken()
  return token
}

/** Headers para PostgREST. Usa el token del admin logueado si existe (y lo
 *  renueva si hace falta); si no, la anon key, que sólo permite leer. */
export async function sbHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = (await freshAccessToken()) ?? supabaseConfig.anonKey ?? ''
  return {
    apikey: supabaseConfig.anonKey ?? '',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

/**
 * Headers para lo que SÓLO puede hacer el admin.
 *
 * A diferencia de `sbHeaders`, no cae a la anon key: si la sesión venció,
 * falla acá con un mensaje claro. Con la anon key el pedido llega igual, pero
 * las políticas de la base no dejan ver ninguna fila, así que un DELETE borra
 * cero filas y PostgREST devuelve 204 —éxito— sin que nada se haya borrado.
 * Fallar temprano es la única forma de que eso no pase inadvertido.
 */
export async function sbAdminHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await freshAccessToken()
  if (!token) {
    throw new Error('Tu sesión venció. Cerrá sesión y volvé a entrar para guardar los cambios.')
  }
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

/** Endpoint de subida a Storage (requiere sesión con permiso de escritura). */
export function storageUrl(bucket: string, path: string): string {
  return `${supabaseConfig.url}/storage/v1/object/${bucket}/${path}`
}

/** URL pública de lectura de un archivo del bucket. */
export function publicStorageUrl(bucket: string, path: string): string {
  return `${supabaseConfig.url}/storage/v1/object/public/${bucket}/${path}`
}
