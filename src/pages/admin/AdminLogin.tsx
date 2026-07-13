import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { backendName } from '../../lib/catalog'
import { hasSupabase } from '../../lib/supabase'
import { Button } from '../../components/ui'
import BrandMascot from '../../components/mascot/BrandMascot'

export default function AdminLogin() {
  const { signIn } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login__card" onSubmit={submit}>
        <BrandMascot variant="question" className="admin-login__mascot" title="Guantín en la puerta" />
        <h1 className="admin-login__title">Panel de gestión</h1>
        <p className="admin-login__sub">Ingresá para administrar productos y stock.</p>

        {hasSupabase() ? (
          <label className="admin-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
        ) : null}

        <label className="admin-field">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            autoFocus
          />
        </label>

        {error && <p className="admin-login__error">{error}</p>}

        <Button variant="red" className="admin-login__submit" type="submit" disabled={busy}>
          {busy ? 'Ingresando…' : 'Entrar'}
        </Button>

        <p className="admin-login__hint">
          Backend: <strong>{backendName}</strong>
          {!hasSupabase() && (
            <>
              {' '}
              · Demo local — contraseña por defecto <code>guantin</code>
            </>
          )}
        </p>
        <Link to="/" className="admin-login__back">
          ← Volver a la tienda
        </Link>
      </form>
    </main>
  )
}
