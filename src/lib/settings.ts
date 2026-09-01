// Configuración de la tienda editable desde el panel. Hoy sólo envíos, pero
// la tabla es clave/valor para que sumar otros ajustes no requiera migrar.
//
// Los precios de envío estaban en el código: cambiarlos obligaba a redeployar.

import { hasSupabase, restUrl, sbHeaders } from './supabase'
import { SHIPPING_METHODS } from '../data/shop'

/** Ajustes por método. Lo que no se toca hereda el valor por defecto. */
export interface ShippingOverride {
  price: number
  enabled: boolean
}

export interface ShippingSettings {
  freeThreshold: number
  methods: Record<string, ShippingOverride>
}

export const DEFAULT_FREE_THRESHOLD = 50000

export function defaultShippingSettings(): ShippingSettings {
  return {
    freeThreshold: DEFAULT_FREE_THRESHOLD,
    methods: Object.fromEntries(SHIPPING_METHODS.map((m) => [m.id, { price: m.price, enabled: true }])),
  }
}

/** Completa con los valores por defecto lo que falte, así agregar un método
 *  nuevo al código no rompe una configuración guardada antes. */
function merge(saved: Partial<ShippingSettings> | null): ShippingSettings {
  const base = defaultShippingSettings()
  if (!saved) return base
  return {
    freeThreshold: typeof saved.freeThreshold === 'number' ? saved.freeThreshold : base.freeThreshold,
    methods: Object.fromEntries(
      SHIPPING_METHODS.map((m) => {
        const o = saved.methods?.[m.id]
        return [
          m.id,
          {
            price: typeof o?.price === 'number' ? o.price : m.price,
            enabled: typeof o?.enabled === 'boolean' ? o.enabled : true,
          },
        ]
      }),
    ),
  }
}

const KEY = 'agn-settings-shipping-v1'
const ROW = 'shipping'

export async function loadShippingSettings(): Promise<ShippingSettings> {
  if (!hasSupabase()) {
    try {
      const raw = localStorage.getItem(KEY)
      return merge(raw ? (JSON.parse(raw) as ShippingSettings) : null)
    } catch {
      return defaultShippingSettings()
    }
  }
  try {
    const res = await fetch(restUrl(`settings?select=value&key=eq.${ROW}`), { headers: await sbHeaders() })
    if (!res.ok) return defaultShippingSettings()
    const rows = (await res.json()) as { value: Partial<ShippingSettings> }[]
    return merge(rows[0]?.value ?? null)
  } catch {
    // Si la configuración no se puede leer, la tienda sigue vendiendo con los
    // precios por defecto en vez de romperse.
    return defaultShippingSettings()
  }
}

export async function saveShippingSettings(settings: ShippingSettings): Promise<void> {
  if (!hasSupabase()) {
    localStorage.setItem(KEY, JSON.stringify(settings))
    return
  }
  const res = await fetch(restUrl('settings?on_conflict=key'), {
    method: 'POST',
    headers: await sbHeaders({ Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify({ key: ROW, value: settings }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`No se pudo guardar la configuración (${res.status}): ${body || res.statusText}`)
  }
}
