import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { getAuth, type AdminSession } from '../lib/auth'

interface AdminAuthValue {
  session: AdminSession | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<AdminAuthValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const auth = getAuth()
  const [session, setSession] = useState<AdminSession | null>(() => auth.current())

  const signIn = useCallback(
    async (email: string, password: string) => {
      const s = await auth.signIn(email, password)
      setSession(s)
    },
    [auth],
  )

  const signOut = useCallback(async () => {
    await auth.signOut()
    setSession(null)
  }, [auth])

  const value = useMemo<AdminAuthValue>(() => ({ session, signIn, signOut }), [session, signIn, signOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAdminAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAdminAuth fuera de AdminAuthProvider')
  return v
}
