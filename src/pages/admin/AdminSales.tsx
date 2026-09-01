import { useMemo, useState } from 'react'
import { useCatalog } from '../../context/CatalogContext'
import { formatPrice } from '../../lib/format'
import { customerWhatsappLink, getPaymentMethod } from '../../data/shop'
import { Bar, PeriodSelect, sinceOf, useOrders, type Period } from './statsShared'

type Sort = 'recientes' | 'antiguos' | 'monto-desc' | 'monto-asc'

export default function AdminSales() {
  const { categories } = useCatalog()
  const { orders, error } = useOrders()
  const [period, setPeriod] = useState<Period>(30)
  const [sort, setSort] = useState<Sort>('recientes')
  const [province, setProvince] = useState('todas')

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug

  const inRange = useMemo(() => {
    if (!orders) return null
    const since = sinceOf(period)
    return orders.filter((o) => new Date(o.createdAt).getTime() >= since)
  }, [orders, period])

  // ---- Totales del período -------------------------------------------------
  const sales = useMemo(() => {
    if (!inRange) return null
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
  }, [inRange])

  // ---- Geografía -----------------------------------------------------------
  // De dónde compran. Sirve para negociar tarifas de envío y para decidir si
  // conviene un punto de retiro en alguna zona.
  const geo = useMemo(() => {
    if (!inRange) return null
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
      .map(([p, v]) => ({ province: p, ...v, cities: [...v.cities] }))
      .sort((a, b) => b.orders - a.orders)
    return { rows, sinDato, conDato: inRange.length - sinDato }
  }, [inRange])

  // ---- Lista de pedidos ----------------------------------------------------
  const visible = useMemo(() => {
    if (!inRange) return []
    const list = inRange.filter((o) => province === 'todas' || o.address?.province === province)
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'antiguos':
          return a.createdAt.localeCompare(b.createdAt)
        case 'monto-desc':
          return b.total - a.total
        case 'monto-asc':
          return a.total - b.total
        default:
          return b.createdAt.localeCompare(a.createdAt)
      }
    })
  }, [inRange, sort, province])

  const provinceOptions = useMemo(() => {
    const set = new Set<string>()
    for (const o of orders ?? []) if (o.address?.province) set.add(o.address.province)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [orders])

  /** Mensaje para cerrar el envío: dice qué se compró y a dónde va. */
  const shippingMsg = (o: (typeof visible)[number]) => {
    const dir = o.address
      ? `${o.address.street}, ${o.address.city} (CP ${o.address.zip}), ${o.address.province}`
      : 'la dirección que nos pasaste'
    return `¡Hola${o.customer?.name ? ` ${o.customer.name.split(' ')[0]}` : ''}! Te escribimos de A Guantes Negros por el pedido ${o.id} (${formatPrice(o.total)}). Lo enviamos a ${dir}. Te paso las opciones de envío con el costo para que elijas.`
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Ventas</h1>
          <p className="admin-page__meta">Pedidos, ingresos y de dónde compran</p>
        </div>
        <div className="admin-page__actions">
          <PeriodSelect value={period} onChange={setPeriod} />
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {orders === null && !error ? (
        <p className="admin-page__meta">Cargando pedidos…</p>
      ) : sales && sales.count === 0 ? (
        <p className="admin-alert">
          Todavía no hay pedidos registrados en este período. Cada compra finalizada queda guardada acá con los datos
          del cliente y la dirección, que es lo que hace falta para coordinar el envío por WhatsApp.
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

            {/* ---- PEDIDOS ---- */}
            <h2 className="stat-section">Pedidos</h2>
            <p className="admin-page__meta">
              El envío no se cobra en la web: se coordina por WhatsApp. Cada pedido trae la dirección completa para
              cotizarlo y despacharlo sin volver a preguntar.
            </p>

            <div className="admin-filters">
              <label className="admin-filters__field">
                Provincia
                <select value={province} onChange={(e) => setProvince(e.target.value)}>
                  <option value="todas">Todas</option>
                  {provinceOptions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="admin-filters__field">
                Ordenar por
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                  <option value="recientes">Más recientes</option>
                  <option value="antiguos">Más antiguos</option>
                  <option value="monto-desc">Monto: mayor a menor</option>
                  <option value="monto-asc">Monto: menor a mayor</option>
                </select>
              </label>
              <p className="admin-filters__count">
                {visible.length === sales.count
                  ? `${sales.count} ${sales.count === 1 ? 'pedido' : 'pedidos'}`
                  : `${visible.length} de ${sales.count}`}
              </p>
            </div>

            {visible.length === 0 ? (
              <p className="admin-alert">Ningún pedido coincide con los filtros.</p>
            ) : (
              <div className="admin-cards admin-cards--always">
                {visible.map((o) => {
                  const wa = o.customer?.whatsapp ? customerWhatsappLink(o.customer.whatsapp, shippingMsg(o)) : null
                  return (
                    <article key={o.id} className="admin-card">
                      <div className="admin-card__head">
                        <strong>
                          {o.id} · {formatPrice(o.total)}
                        </strong>
                        <span className="admin-card__sub">
                          {new Date(o.createdAt).toLocaleDateString('es-AR')} ·{' '}
                          {getPaymentMethod(o.paymentMethod ?? '')?.label ?? 'Pago a coordinar'}
                        </span>
                      </div>

                      <ul className="stat-list stat-list--plain">
                        {o.items.map((i) => (
                          <li key={i.slug}>
                            <span>
                              {i.name} <em>×{i.qty}</em>
                            </span>
                            <span>{formatPrice(i.price * i.qty)}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="admin-card__grid">
                        <div className="admin-card__field">
                          <span>Cliente</span>
                          <span className="admin-card__value">{o.customer?.name || '—'}</span>
                        </div>
                        <div className="admin-card__field">
                          <span>Contacto</span>
                          <span className="admin-card__value">{o.customer?.email || '—'}</span>
                        </div>
                      </div>

                      <div className="admin-card__field">
                        <span>Enviar a</span>
                        <span className="admin-card__value">
                          {o.address
                            ? `${o.address.street}, ${o.address.city} (CP ${o.address.zip}) — ${o.address.province}`
                            : 'Sin dirección registrada'}
                        </span>
                      </div>

                      {o.customer?.whatsapp && (
                        <div className="admin-card__actions">
                          {wa ? (
                            <a
                              className="admin-btn admin-btn--sm admin-btn--white"
                              href={wa}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Coordinar envío por WhatsApp ↗
                            </a>
                          ) : (
                            <span className="admin-card__sub">WhatsApp: {o.customer.whatsapp}</span>
                          )}
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            )}

            {/* ---- QUÉ SE VENDE ---- */}
            <h2 className="stat-section">Qué se vende</h2>
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

            {/* ---- GEOGRAFÍA ---- */}
            <h2 className="stat-section">De dónde compran</h2>
            {!geo || geo.rows.length === 0 ? (
              <p className="admin-alert">
                Todavía no hay pedidos con provincia registrada en este período. Desde ahora se pide siempre en el
                checkout.
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
          </>
        )
      )}
    </div>
  )
}
