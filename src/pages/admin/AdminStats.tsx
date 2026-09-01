import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { listOrders, type Order } from '../../lib/orders'
import { stockOf } from '../../data/catalog'
import { formatPrice } from '../../lib/format'

const LOW_STOCK = 5

type Period = 7 | 30 | 90 | 0 // 0 = todo

const PERIODS: [Period, string][] = [
  [7, 'Últimos 7 días'],
  [30, 'Últimos 30 días'],
  [90, 'Últimos 90 días'],
  [0, 'Todo'],
]

/** Barra proporcional para comparar magnitudes dentro de una lista. */
function Bar({ label, value, max, hint }: { label: string; value: number; max: number; hint: string }) {
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

export default function AdminStats() {
  const { products, categories } = useCatalog()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>(30)

  useEffect(() => {
    let alive = true
    listOrders()
      .then((o) => alive && setOrders(o))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'No se pudieron leer los pedidos'))
    return () => {
      alive = false
    }
  }, [])

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug

  // ---- Ventas del período ------------------------------------------------
  const sales = useMemo(() => {
    if (!orders) return null
    const since = period === 0 ? 0 : Date.now() - period * 24 * 60 * 60 * 1000
    const inRange = orders.filter((o) => new Date(o.createdAt).getTime() >= since)
    const revenue = inRange.reduce((s, o) => s + o.total, 0)
    const units = inRange.reduce((s, o) => s + o.items.reduce((n, i) => n + i.qty, 0), 0)

    // Sólo se puede calcular margen sobre las líneas que tenían costo cargado.
    // Se informa la cobertura para no leer un margen parcial como si fuera total.
    let soldWithCost = 0
    let soldTotal = 0
    let cogs = 0
    let revenueWithCost = 0
    for (const o of inRange) {
      for (const i of o.items) {
        soldTotal += i.qty
        if (typeof i.cost === 'number') {
          soldWithCost += i.qty
          cogs += i.cost * i.qty
          revenueWithCost += i.price * i.qty
        }
      }
    }
    const margin = revenueWithCost - cogs

    const byProduct = new Map<string, { name: string; units: number; revenue: number }>()
    const byCategory = new Map<string, number>()
    for (const o of inRange) {
      for (const i of o.items) {
        const prev = byProduct.get(i.slug) ?? { name: i.name, units: 0, revenue: 0 }
        prev.units += i.qty
        prev.revenue += i.price * i.qty
        byProduct.set(i.slug, prev)
        byCategory.set(i.category, (byCategory.get(i.category) ?? 0) + i.price * i.qty)
      }
    }
    return {
      count: inRange.length,
      revenue,
      units,
      ticket: inRange.length ? Math.round(revenue / inRange.length) : 0,
      margin,
      marginPct: revenueWithCost > 0 ? Math.round((margin / revenueWithCost) * 100) : 0,
      costCoverage: soldTotal > 0 ? Math.round((soldWithCost / soldTotal) * 100) : 0,
      topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      byCategory: [...byCategory.entries()].sort((a, b) => b[1] - a[1]),
    }
  }, [orders, period])

  // ---- Inventario (disponible siempre) -----------------------------------
  const inventory = useMemo(() => {
    const value = products.reduce((s, p) => s + p.price * stockOf(p), 0)
    const units = products.reduce((s, p) => s + stockOf(p), 0)
    const out = products.filter((p) => stockOf(p) <= 0)
    const low = products.filter((p) => stockOf(p) > 0 && stockOf(p) <= LOW_STOCK)
    const noPhoto = products.filter((p) => !p.images?.length)
    const noCost = products.filter((p) => typeof p.cost !== 'number')
    // Lo que costó comprar el stock, contra lo que vale a precio de venta.
    const cost = products.reduce((s, p) => s + (p.cost ?? 0) * stockOf(p), 0)
    const byCategory = categories
      .map((c) => {
        const list = products.filter((p) => p.category === c.slug)
        return { name: c.name, value: list.reduce((s, p) => s + p.price * stockOf(p), 0), count: list.length }
      })
      .sort((a, b) => b.value - a.value)
    return { value, units, out, low, noPhoto, noCost, cost, byCategory }
  }, [products, categories])

  const maxCatValue = Math.max(1, ...inventory.byCategory.map((c) => c.value))

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Estadísticas</h1>
          <p className="admin-page__meta">Ventas e inventario</p>
        </div>
        <div className="admin-page__actions">
          <label className="admin-filters__field">
            Período
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value) as Period)}>
              {PERIODS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {/* ---- VENTAS ---- */}
      <h2 className="stat-section">Ventas</h2>
      {orders === null && !error ? (
        <p className="admin-page__meta">Cargando pedidos…</p>
      ) : sales && sales.count === 0 ? (
        <p className="admin-alert">
          Todavía no hay pedidos registrados en este período. Las ventas se empiezan a registrar desde ahora: cada compra
          finalizada queda guardada y alimenta estos números.
        </p>
      ) : (
        sales && (
          <>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="stat-card__label">Ingresos</span>
                <strong className="stat-card__value">{formatPrice(sales.revenue)}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Pedidos</span>
                <strong className="stat-card__value">{sales.count}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Ticket promedio</span>
                <strong className="stat-card__value">{formatPrice(sales.ticket)}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Unidades vendidas</span>
                <strong className="stat-card__value">{sales.units}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Ganancia bruta</span>
                <strong className="stat-card__value">
                  {sales.costCoverage > 0 ? formatPrice(sales.margin) : '—'}
                </strong>
                <span className="stat-card__foot">
                  {sales.costCoverage === 0
                    ? 'Cargá el costo de los productos'
                    : sales.costCoverage < 100
                      ? `${sales.marginPct}% · sólo ${sales.costCoverage}% de lo vendido tiene costo`
                      : `${sales.marginPct}% sobre lo vendido`}
                </span>
              </div>
            </div>

            <h3 className="stat-subtitle">Más vendidos del período</h3>
            <ul className="stat-bars">
              {sales.topProducts.map((p) => (
                <Bar
                  key={p.name}
                  label={p.name}
                  value={p.revenue}
                  max={sales.topProducts[0]?.revenue ?? 1}
                  hint={`${p.units} u · ${formatPrice(p.revenue)}`}
                />
              ))}
            </ul>

            <h3 className="stat-subtitle">Ingresos por categoría</h3>
            <ul className="stat-bars">
              {sales.byCategory.map(([slug, value]) => (
                <Bar
                  key={slug}
                  label={categoryName(slug)}
                  value={value}
                  max={sales.byCategory[0]?.[1] ?? 1}
                  hint={formatPrice(value)}
                />
              ))}
            </ul>
          </>
        )
      )}

      {/* ---- INVENTARIO ---- */}
      <h2 className="stat-section">Inventario</h2>
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Valor en stock</span>
          <strong className="stat-card__value">{formatPrice(inventory.value)}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Unidades</span>
          <strong className="stat-card__value">{inventory.units}</strong>
        </div>
        <div className={`stat-card ${inventory.out.length ? 'stat-card--alert' : ''}`}>
          <span className="stat-card__label">Agotados</span>
          <strong className="stat-card__value">{inventory.out.length}</strong>
        </div>
        <div className={`stat-card ${inventory.low.length ? 'stat-card--warn' : ''}`}>
          <span className="stat-card__label">Stock bajo (≤ {LOW_STOCK})</span>
          <strong className="stat-card__value">{inventory.low.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Capital invertido</span>
          <strong className="stat-card__value">
            {inventory.cost > 0 ? formatPrice(inventory.cost) : '—'}
          </strong>
          <span className="stat-card__foot">
            {inventory.noCost.length
              ? `${inventory.noCost.length} productos sin costo cargado`
              : 'Costo de todo el stock'}
          </span>
        </div>
      </div>

      <h3 className="stat-subtitle">Valor inmovilizado por categoría</h3>
      <ul className="stat-bars">
        {inventory.byCategory.map((c) => (
          <Bar key={c.name} label={c.name} value={c.value} max={maxCatValue} hint={formatPrice(c.value)} />
        ))}
      </ul>

      {(inventory.out.length > 0 || inventory.low.length > 0) && (
        <>
          <h3 className="stat-subtitle">Reponer</h3>
          <ul className="stat-list">
            {[...inventory.out, ...inventory.low].slice(0, 12).map((p) => (
              <li key={p.slug}>
                <Link to={`/admin/productos/${p.slug}`}>{p.name}</Link>
                <span className={stockOf(p) <= 0 ? 'stat-tag stat-tag--out' : 'stat-tag stat-tag--low'}>
                  {stockOf(p) <= 0 ? 'Agotado' : `${stockOf(p)} u`}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {inventory.noPhoto.length > 0 && (
        <>
          <h3 className="stat-subtitle">Sin foto ({inventory.noPhoto.length})</h3>
          <p className="admin-page__meta">
            Usan la ilustración de la marca. Las fichas con foto real suelen convertir mejor.
          </p>
          <ul className="stat-list">
            {inventory.noPhoto.slice(0, 8).map((p) => (
              <li key={p.slug}>
                <Link to={`/admin/productos/${p.slug}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
