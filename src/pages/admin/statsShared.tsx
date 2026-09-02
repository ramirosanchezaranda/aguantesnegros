// Piezas comunes a Ventas, Clientes y Estadísticas. Antes las tres pantallas
// eran una sola: al separarlas, el selector de período, la barra comparativa y
// la lectura de pedidos son lo único que quedó compartido.

import { useEffect, useState } from 'react'
import { listOrders, type Order } from '../../lib/orders'

export type Period = 7 | 30 | 90 | 0 // 0 = todo

export const PERIODS: [Period, string][] = [
  [7, 'Últimos 7 días'],
  [30, 'Últimos 30 días'],
  [90, 'Últimos 90 días'],
  [0, 'Todo'],
]

/** Momento a partir del cual cuenta un período. 0 = desde siempre. */
export function sinceOf(period: Period): number {
  return period === 0 ? 0 : Date.now() - period * 24 * 60 * 60 * 1000
}

export function PeriodSelect({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <label className="admin-filters__field">
      Período
      <select value={value} onChange={(e) => onChange(Number(e.target.value) as Period)}>
        {PERIODS.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}

/** Barra proporcional para comparar magnitudes dentro de una lista. */
export function Bar({ label, value, max, hint }: { label: string; value: number; max: number; hint: string }) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <li className="stat-bar">
      <span className="stat-bar__label">{label}</span>
      <span className="stat-bar__track">
        <span className="stat-bar__fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="stat-bar__value">{hint}</span>
    </li>
  )
}

/** Pedidos del backend. `orders === null` mientras carga. */
export function useOrders(): { orders: Order[] | null; error: string | null } {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    listOrders()
      .then((o) => alive && setOrders(o))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'No se pudieron leer los pedidos'))
    return () => {
      alive = false
    }
  }, [])
  return { orders, error }
}
