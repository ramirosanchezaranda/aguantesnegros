// Microsoft Clarity: mapas de clic y scroll, y grabaciones de sesión.
//
// Sólo se carga si hay VITE_CLARITY_ID, así que en desarrollo y en la preview
// no corre. Nunca se carga en /admin: ahí se ven costos, márgenes y stock, y no
// tiene sentido mandarle eso a un tercero (además de que grabar la operación
// propia no aporta nada).

const CLARITY_ID = import.meta.env.VITE_CLARITY_ID as string | undefined

export function hasClarity(): boolean {
  return Boolean(CLARITY_ID)
}

/**
 * Enlaces al panel de Clarity. Sus mapas de calor no se pueden incrustar
 * —no hay iframe ni widget—, así que lo mejor posible es llevar directo a
 * la vista correspondiente en vez de duplicar mal lo que ya hace bien.
 */
export const clarityLinks = CLARITY_ID
  ? {
      dashboard: `https://clarity.microsoft.com/projects/view/${CLARITY_ID}/dashboard`,
      heatmaps: `https://clarity.microsoft.com/projects/view/${CLARITY_ID}/heatmaps`,
    }
  : null

let loaded = false

/** Inyecta el script de Clarity una sola vez. */
export function initClarity(): void {
  if (loaded || !CLARITY_ID) return
  if (typeof document === 'undefined') return
  loaded = true

  const w = window as unknown as Record<string, unknown> & { clarity?: unknown }
  // Cola de llamadas: permite usar `clarity(...)` antes de que el script cargue.
  const queue: unknown[][] = []
  if (!w.clarity) {
    const shim = (...args: unknown[]) => queue.push(args)
    ;(shim as unknown as { q: unknown[][] }).q = queue
    w.clarity = shim
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`
  document.head.appendChild(script)
}
