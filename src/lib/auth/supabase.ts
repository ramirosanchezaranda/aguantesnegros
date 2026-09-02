import { authUrl, setAccessToken, supabaseConfig } from '../supabase'
import type { AdminSession, AuthClient } from './types'

// Auth real contra Supabase (GoTrue). El access token se guarda para
// firmar las escrituras a PostgREST, de modo que apliquen las políticas RLS.

const SESSION_KEY = 'agn-admin-session'

export function createSupabaseAuth(): AuthClient {
  return {
    current() {
      try {
        const raw = localStorage.getItem(SESSION_KEY)
        return raw ? (JSON.parse(raw) as AdminSession) : null
      } catch {
        return null
      }
    },
    async signIn(email, password) {
      const res = await fetch(authUrl('token?grant_type=password'), {
        method: 'POST',
        headers: { apikey: supabaseConfig.anonKey ?? '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (!res.ok) throw new Error('Credenciales inválidas')
      
      // Solo aguantesnegros.info@gmail.com puede acceder al panel
      const adminEmail = 'aguantesnegros.info@gmail.com'
      if (email.trim().toLowerCase() !== adminEmail) {
        throw new Error(`Solo ${adminEmail} puede acceder al panel`)
      }
      
      const data = (await res.json()) as { access_token: string; user?: { email?: string } }
      setAccessToken(data.access_token)
      const session: AdminSession = { email: data.user?.email ?? email.trim() }
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      } catch {
        /* almacenamiento no disponible */
      }
      return session
    },
    async signOut() {
      setAccessToken(null)
      try {
        localStorage.removeItem(SESSION_KEY)
      } catch {
        /* almacenamiento no disponible */
      }
    },
  }
}
