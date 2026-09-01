import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { listOrders, type Order } from '../../lib/orders'
import { listCarts, type TrackedCart } from '../../lib/carts'
import { stockOf } from '../../data/catalog'
import { clarityLinks } from '../../lib/clarity'
import { whatsappLink } from '../../data/shop'
import { formatPrice } from '../../lib/format'

const LOW_STOCK = 5

/** Un carrito sin tocar por más de estas horas ya no es una sesión activa. */
const ABANDON_HOURS = 2

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
  const [carts, setCarts] = useState<TrackedCart[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>(30)

  useEffect(() => {
    let alive = true
    listOrders()
      .then((o) => alive && setOrders(o))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'No se pudieron leer los pedidos'))
    listCarts()
      .then((c) => alive && setCarts(c))
      .catch(() => alive && setCarts([]))
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

  // ---- Clientes ----------------------------------------------------------
  // Se arman desde los pedidos: el email es la clave, porque el WhatsApp suele
  // escribirse distinto (con o sin 15, con o sin +54).
  const customers = useMemo(() => {
    if (!orders) return []
    const map = new Map<
      string,
      { name: string; email: string; whatsapp: string; orders: number; spent: number; last: string }
    >()
    for (const o of orders) {
      const c = o.customer
      if (!c?.email) continue
      const key = c.email.trim().toLowerCase()
      const prev = map.get(key)
      if (prev) {
        prev.orders += 1
        prev.spent += o.total
        if (o.createdAt > prev.last) {
          prev.last = o.createdAt
          prev.name = c.name || prev.name
          prev.whatsapp = c.whatsapp || prev.whatsapp
        }
      } else {
        map.set(key, {
          name: c.name,
          email: c.email,
          whatsapp: c.whatsapp,
          orders: 1,
          spent: o.total,
          last: o.createdAt,
        })
      }
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent)
  }, [orders])

  // ---- Geografía ---------------------------------------------------------
  // De dónde compran. Sirve para negociar tarifas de envío y para decidir si
  // conviene un punto de retiro en alguna zona.
  const geo = useMemo(() => {
    if (!orders) return null
    const since = period === 0 ? 0 : Date.now() - period * 24 * 60 * 60 * 1000
    const inRange = orders.filter((o) => new Date(o.createdAt).getTime() >= since)
    const map = new Map<string, { orders: number; revenue: number; cities: Set<string> }>()
    let sinDato = 0
    for (const o of inRange) {
      const prov = o.address?.province?.trim()
      if (!prov) {
        sinDato += 1
        continue
      }
      const prev = map.get(prov) ?? { orders: 0, revenue: 0, cities: new Set<string>() }
      prev.orders += 1
      prev.revenue += o.total
      if (o.address?.city?.trim()) prev.cities.add(o.address.city.trim())
      map.set(prov, prev)
    }
    const rows = [...map.entries()]
      .map(([province, v]) => ({ province, ...v, cities: [...v.cities] }))
      .sort((a, b) => b.orders - a.orders)
    const conDato = inRange.length - sinDato
    return { rows, sinDato, conDato }
  }, [orders, period])

  // ---- Carritos ----------------------------------------------------------
  const cartStats = useMemo(() => {
    if (!carts) return null
    const since = period === 0 ? 0 : Date.now() - period * 24 * 60 * 60 * 1000
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

      {/* ---- GEOGRAFÍA ---- */}
      <h2 className="stat-section">De dónde compran</h2>
      {!geo || geo.rows.length === 0 ? (
        <p className="admin-alert">
          Todavía no hay pedidos con provincia registrada en este período. Desde ahora se pide siempre en el checkout,
          incluso cuando el envío es a sucursal o punto de encuentro.
        </p>
      ) : (
        <>
          <ul className="stat-bars">
            {geo.rows.map((r) => (
              <Bar
                key={r.province}
                label={r.province}
                value={r.orders}
                max={geo.rows[0]?.orders ?? 1}
                hint={`${r.orders} ${r.orders === 1 ? 'pedido' : 'pedidos'} · ${formatPrice(r.revenue)}`}
              />
            ))}
          </ul>
          <p className="admin-page__meta">
            {geo.rows[0] && (
              <>
                <strong>{geo.rows[0].province}</strong> concentra{' '}
                {Math.round((geo.rows[0].orders / Math.max(1, geo.conDato)) * 100)}% de los pedidos
                {geo.rows[0].cities.length > 0 && ` (${geo.rows[0].cities.slice(0, 3).join(', ')})`}.{' '}
              </>
            )}
            {geo.sinDato > 0 &&
              `${geo.sinDato} pedidos anteriores no tienen provincia: se registra desde este cambio.`}
          </p>
        </>
      )}

      {/* ---- CLIENTES ---- */}
      <h2 className="stat-section">Clientes</h2>
      {customers.length === 0 ? (
        <p className="admin-alert">
          Todavía no hay clientes registrados. Se arman solos a partir de los pedidos: cada compra guarda nombre, email
          y WhatsApp para poder coordinar la entrega y el pago.
        </p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-card__label">Clientes</span>
              <strong className="stat-card__value">{customers.length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Con más de una compra</span>
              <strong className="stat-card__value">{customers.filter((c) => c.orders > 1).length}</strong>
              <span className="stat-card__foot">La recompra es el termómetro del rubro</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Gasto promedio</span>
              <strong className="stat-card__value">
                {formatPrice(Math.round(customers.reduce((s, c) => s + c.spent, 0) / customers.length))}
              </strong>
            </div>
          </div>

          <div className="admin-table-wrap admin-table-wrap--collapse">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Pedidos</th>
                  <th>Total gastado</th>
                  <th>Última compra</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.email}>
                    <td>
                      <strong>{c.name || '—'}</strong>
                    </td>
                    <td>
                      <span className="admin-table__sub">{c.email}</span>
                      {c.whatsapp && (
                        <a href={whatsappLink()} target="_blank" rel="noreferrer" className="stat-wa">
                          {c.whatsapp} ↗
                        </a>
                      )}
                    </td>
                    <td>{c.orders}</td>
                    <td>{formatPrice(c.spent)}</td>
                    <td>{new Date(c.last).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Vista de cards (teléfonos, tablets y ventanas angostas) */}
          <div className="admin-cards">
            {customers.map((c) => (
              <article key={c.email} className="admin-card">
                <div className="admin-card__head">
                  <strong>{c.name || '—'}</strong>
                  <span className="admin-card__sub">{c.email}</span>
                  {c.whatsapp && (
                    <a href={whatsappLink()} target="_blank" rel="noreferrer" className="stat-wa">
                      {c.whatsapp} ↗
                    </a>
                  )}
                </div>
                <div className="admin-card__grid">
                  <div className="admin-card__field">
                    <span>Pedidos</span>
                    <span className="admin-card__value">{c.orders}</span>
                  </div>
                  <div className="admin-card__field">
                    <span>Total gastado</span>
                    <span className="admin-card__value">{formatPrice(c.spent)}</span>
                  </div>
                </div>
                <p className="admin-card__sub">
                  Última compra: {new Date(c.last).toLocaleDateString('es-AR')}
                </p>
              </article>
            ))}
          </div>

          <p className="admin-page__meta">
            Son datos personales: tratalos con cuidado y no los uses para nada que la persona no haya esperado al
            comprar.
          </p>
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
