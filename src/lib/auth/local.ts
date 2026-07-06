import type { AdminSession, AuthClient } from './types'

// Puerta de admin para el modo local (demo). No es seguridad real:
// todo corre en el navegador. Sirve para probar el panel sin backend.
// La contraseña se configura con VITE_ADMIN_PASSWORD (por defecto "guantin").

const SESSION_KEY = 'agn-admin-session'
const PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'guantin'

export function createLocalAuth(): AuthClient {
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
      if (password !== PASSWORD) throw new Error('Contraseña incorrecta')
      const session: AdminSession = { email: email.trim() || 'admin' }
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      } catch {
        /* almacenamiento no disponible */
      }
      return session
    },
    async signOut() {
      try {
        localStorage.removeItem(SESSION_KEY)
      } catch {
        /* almacenamiento no disponible */
      }
    },
  }
}
