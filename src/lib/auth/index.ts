import { hasSupabase } from '../supabase'
import { createLocalAuth } from './local'
import { createSupabaseAuth } from './supabase'
import type { AuthClient } from './types'

let client: AuthClient | null = null

export function getAuth(): AuthClient {
  if (!client) client = hasSupabase() ? createSupabaseAuth() : createLocalAuth()
  return client
}

export type { AdminSession, AuthClient } from './types'
