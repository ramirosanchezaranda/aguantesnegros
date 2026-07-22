export interface AdminSession {
  email: string
}

export interface AuthClient {
  /** Sesión guardada (si la hay), sin ir a la red. */
  current(): AdminSession | null
  signIn(email: string, password: string): Promise<AdminSession>
  signOut(): Promise<void>
}
