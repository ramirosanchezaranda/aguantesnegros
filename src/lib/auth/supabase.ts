import { authUrl, clearSession, saveSession, SESSION_KEY, supabaseConfig, type TokenResponse } from '../supabase'
import type { AdminSession, AuthClient } from './types'

// Auth real contra Supabase (GoTrue). El access token se guarda —junto con el
// refresh token— para firmar las escrituras a PostgREST, de modo que apliquen
// las políticas RLS. La renovación la maneja `sbHeaders()`.

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
      const data = (await res.json()) as TokenResponse
      saveSession(data)
      const session: AdminSession = { email: data.user?.email ?? email.trim() }
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      } catch {
        /* almacenamiento no disponible */
      }
      return session
    },
    async signOut() {
      clearSession()
    },
  }
}
