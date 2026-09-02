import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { listCarts, type TrackedCart } from '../../lib/carts'
import { stockOf } from '../../data/catalog'
import { clarityLinks } from '../../lib/clarity'
import { formatPrice } from '../../lib/format'
import { Bar, PeriodSelect, sinceOf, type Period } from './statsShared'

const LOW_STOCK = 5

/** Un carrito sin tocar por más de estas horas ya no es una sesión activa. */
const ABANDON_HOURS = 2

export default function AdminStats() {
  const { products, categories } = useCatalog()
  const [carts, setCarts] = useState<TrackedCart[] | null>(null)
  const [period, setPeriod] = useState<Period>(30)

  useEffect(() => {
    let alive = true
    listCarts()
      .then((c) => alive && setCarts(c))
      .catch(() => alive && setCarts([]))
    return () => {
      alive = false
    }
  }, [])

  // ---- Carritos ----------------------------------------------------------
  const cartStats = useMemo(() => {
    if (!carts) return null
    const since = sinceOf(period)
    const inRange = carts.filter((c) => new Date(c.updatedAt).getTime() >= since)
    const staleBefore = Date.now() - ABANDON_HOURS * 60 * 60 * 1000

    const converted = inRange.filter((c) => c.convertedAt)
    // Los carritos tocados hace un rato pueden ser sesiones todavía abiertas:
    // contarlos como abandonados inflaría el problema.
    const abandoned = inRange.filter((c) => !c.convertedAt && new Date(c.updatedAt).getTime() < staleBefore)
    const active = inRange.length - converted.length - abandoned.length

    const byProduct = new Map<string, { name: string; qty: number }>()
    for (const c of abandoned) {
      for (const i of c.items) {
        const prev = byProduct.get(i.slug) ?? { name: i.name, qty: 0 }
        prev.qty += i.qty
        byProduct.set(i.slug, prev)
      }
    }
    const decided = converted.length + abandoned.length
    return {
      total: inRange.length,
      converted: converted.length,
      abandoned: abandoned.length,
      active,
      lostValue: abandoned.reduce((s, c) => s + c.subtotal, 0),
      rate: decided > 0 ? Math.round((converted.length / decided) * 100) : null,
      topAbandoned: [...byProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5),
    }
  }, [carts, period])

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
          <p className="admin-page__meta">Carritos, comportamiento e inventario</p>
        </div>
        <div className="admin-page__actions">
          <PeriodSelect value={period} onChange={setPeriod} />
        </div>
      </header>

      <p className="admin-page__meta">
        Los ingresos y los pedidos están en <Link to="/admin/ventas">Ventas</Link>; quién compró, en{' '}
        <Link to="/admin/clientes">Clientes</Link>.
      </p>

      {/* ---- CARRITOS ---- */}
      <h2 className="stat-section">Carritos</h2>
      {!cartStats || cartStats.total === 0 ? (
        <p className="admin-alert">
          Todavía no se registraron carritos en este período. Se cuentan de forma anónima —sólo productos y cantidades,
          ningún dato personal— desde que alguien agrega algo al carrito.
        </p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-card__label">Conversión</span>
              <strong className="stat-card__value">{cartStats.rate === null ? '—' : `${cartStats.rate}%`}</strong>
              <span className="stat-card__foot">
                {cartStats.rate === null ? 'Sin carritos resueltos aún' : 'De carrito a compra'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Con compra</span>
              <strong className="stat-card__value">{cartStats.converted}</strong>
            </div>
            <div className={`stat-card ${cartStats.abandoned ? 'stat-card--warn' : ''}`}>
              <span className="stat-card__label">Abandonados</span>
              <strong className="stat-card__value">{cartStats.abandoned}</strong>
              <span className="stat-card__foot">Sin actividad hace +{ABANDON_HOURS} h</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Valor no cobrado</span>
              <strong className="stat-card__value">{formatPrice(cartStats.lostValue)}</strong>
              <span className="stat-card__foot">
                {cartStats.active > 0 ? `${cartStats.active} carritos aún activos` : 'En carritos abandonados'}
              </span>
            </div>
          </div>

          {cartStats.topAbandoned.length > 0 && (
            <>
              <h3 className="stat-subtitle">Más abandonados</h3>
              <p className="admin-page__meta">
                Si un producto entra seguido al carrito y no se compra, suele ser precio o costo de envío, no falta de
                interés.
              </p>
              <ul className="stat-bars">
                {cartStats.topAbandoned.map((p) => (
                  <Bar
                    key={p.name}
                    label={p.name}
                    value={p.qty}
                    max={cartStats.topAbandoned[0]?.qty ?? 1}
                    hint={`${p.qty} u`}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* ---- COMPORTAMIENTO ---- */}
      <h2 className="stat-section">Comportamiento</h2>
      {clarityLinks ? (
        <div className="stat-external">
          <p>
            Los mapas de calor y las grabaciones de sesión viven en Microsoft Clarity: no se pueden incrustar acá, así
            que estos enlaces te llevan directo a la vista que corresponde.
          </p>
          <div className="stat-external__links">
            <a className="admin-btn admin-btn--primary" href={clarityLinks.heatmaps} target="_blank" rel="noreferrer">
              Ver mapas de calor ↗
            </a>
            <a className="admin-btn admin-btn--ghost" href={clarityLinks.dashboard} target="_blank" rel="noreferrer">
              Panel completo ↗
            </a>
          </div>
          <p className="admin-page__meta">
            Mirá sobre todo los <strong>rage clicks</strong> (clics repetidos por frustración) y los{' '}
            <strong>dead clicks</strong> (clics en algo que no reacciona): señalan dónde se traban, que es la otra cara
            de los carritos abandonados de arriba.
          </p>
        </div>
      ) : (
        <p className="admin-alert">
          Sin configurar. Definiendo <code>VITE_CLARITY_ID</code> en el hosting se activan los mapas de clic y scroll y
          las grabaciones de sesión, y acá aparecen los accesos directos.
        </p>
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
