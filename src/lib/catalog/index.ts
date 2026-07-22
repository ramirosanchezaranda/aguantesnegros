import { hasSupabase } from '../supabase'
import { createLocalRepo } from './local'
import { createSupabaseRepo } from './supabase'
import type { CatalogRepo } from './types'

let repo: CatalogRepo | null = null

export function getRepo(): CatalogRepo {
  if (!repo) repo = hasSupabase() ? createSupabaseRepo() : createLocalRepo()
  return repo
}

/** Nombre legible del backend activo, para mostrar en el panel. */
export const backendName = hasSupabase() ? 'Supabase' : 'Local (navegador)'

export { resetLocalCatalog } from './local'
export type { CatalogRepo } from './types'
