// Seguimiento de carritos para medir abandono.
//
// Privacidad: NO se guarda ningún dato personal. Sólo un id aleatorio del
// navegador, qué productos entraron al carrito y cuándo. No hay forma de
// llegar desde acá a una persona; sirve para contar, no para contactar.

import { hasSupabase, restUrl, sbAdminHeaders, sbHeaders } from './supabase'

export interface CartLine {
  slug: string
  name: string
  qty: number
}

export interface TrackedCart {
  id: string
  updatedAt: string
  items: CartLine[]
  subtotal: number
  /** Fecha en que ese carrito terminó en compra, si terminó. */
  convertedAt?: string
}

const ID_KEY = 'agn-cart-id'
const LOCAL_KEY = 'agn-carts-v1'

/** Id anónimo y estable por navegador. */
function cartId(): string {
  try {
    let id = localStorage.getItem(ID_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(ID_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

function readLocal(): TrackedCart[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    const parsed = raw ? (JSON.parse(raw) as TrackedCart[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocal(carts: TrackedCart[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(carts))
  } catch {
    /* medir no puede romper la compra */
  }
}

function upsertLocal(cart: TrackedCart): void {
  const all = readLocal()
  const i = all.findIndex((c) => c.id === cart.id)
  if (i >= 0) all[i] = { ...all[i], ...cart }
  else all.push(cart)
  writeLocal(all)
}

/**
 * Registra el estado actual del carrito. Se llama seguido (cada cambio), así
 * que nunca lanza: si falla, se pierde una medición y nada más.
 */
export async function trackCart(items: CartLine[], subtotal: number): Promise<void> {
  if (items.length === 0) return
  const cart: TrackedCart = { id: cartId(), updatedAt: new Date().toISOString(), items, subtotal }

  if (!hasSupabase()) {
    upsertLocal(cart)
    return
  }
  try {
    await fetch(restUrl('carts?on_conflict=id'), {
      method: 'POST',
      headers: await sbHeaders({ Prefer: 'resolution=merge-duplicates' }),
      body: JSON.stringify({
        id: cart.id,
        updated_at: cart.updatedAt,
        items: cart.items,
        subtotal: cart.subtotal,
      }),
    })
  } catch {
    /* medición perdida, sin consecuencias para el usuario */
  }
}

/** Marca el carrito como convertido en compra. */
export async function markCartConverted(): Promise<void> {
  const id = cartId()
  const convertedAt = new Date().toISOString()

  if (!hasSupabase()) {
    const all = readLocal()
    const i = all.findIndex((c) => c.id === id)
    if (i >= 0) {
      all[i].convertedAt = convertedAt
      writeLocal(all)
    }
    // El próximo carrito de este navegador tiene que ser uno nuevo, si no
    // quedaría pisando el que ya se convirtió.
    try {
      localStorage.removeItem(ID_KEY)
    } catch {
      /* nada que hacer */
    }
    return
  }
  try {
    await fetch(restUrl(`carts?id=eq.${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: await sbHeaders(),
      body: JSON.stringify({ converted_at: convertedAt }),
    })
  } catch {
    /* medición perdida */
  }
  try {
    localStorage.removeItem(ID_KEY)
  } catch {
    /* nada que hacer */
  }
}

interface CartRow {
  id: string
  updated_at: string
  items: CartLine[] | null
  subtotal: number
  converted_at: string | null
}

/** Sólo para el panel. */
export async function listCarts(): Promise<TrackedCart[]> {
  if (!hasSupabase()) return readLocal()
  const res = await fetch(restUrl('carts?select=*&order=updated_at.desc'), { headers: await sbAdminHeaders() })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`No se pudieron leer los carritos (${res.status}): ${body || res.statusText}`)
  }
  return ((await res.json()) as CartRow[]).map((r) => ({
    id: r.id,
    updatedAt: r.updated_at,
    items: r.items ?? [],
    subtotal: r.subtotal,
    convertedAt: r.converted_at ?? undefined,
  }))
}
