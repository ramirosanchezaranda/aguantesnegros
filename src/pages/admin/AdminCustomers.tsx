import { useMemo, useState } from 'react'
import { formatPrice } from '../../lib/format'
import { customerWhatsappLink } from '../../data/shop'
import { useOrders } from './statsShared'

type Sort = 'gasto-desc' | 'gasto-asc' | 'pedidos-desc' | 'recientes' | 'nombre'

interface CustomerRow {
  name: string
  email: string
  whatsapp: string
  orders: number
  spent: number
  last: string
  provinces: string[]
}

export default function AdminCustomers() {
  const { orders, error } = useOrders()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('gasto-desc')
  const [only, setOnly] = useState<'todos' | 'recurrentes' | 'una'>('todos')

  // Se arman desde los pedidos: el email es la clave, porque el WhatsApp suele
  // escribirse distinto (con o sin 15, con o sin +54).
  const customers = useMemo<CustomerRow[]>(() => {
    if (!orders) return []
    const map = new Map<string, CustomerRow & { provinceSet: Set<string> }>()
    for (const o of orders) {
      const c = o.customer
      if (!c?.email) continue
      const key = c.email.trim().toLowerCase()
      const prev = map.get(key)
      const prov = o.address?.province?.trim()
      if (prev) {
        prev.orders += 1
        prev.spent += o.total
        if (prov) prev.provinceSet.add(prov)
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
          provinces: [],
          provinceSet: new Set(prov ? [prov] : []),
        })
      }
    }
    return [...map.values()].map(({ provinceSet, ...c }) => ({ ...c, provinces: [...provinceSet] }))
  }, [orders])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = customers.filter((c) => {
      if (q && !`${c.name} ${c.email} ${c.whatsapp}`.toLowerCase().includes(q)) return false
      if (only === 'recurrentes' && c.orders < 2) return false
      if (only === 'una' && c.orders !== 1) return false
      return true
    })
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'gasto-asc':
          return a.spent - b.spent
        case 'pedidos-desc':
          return b.orders - a.orders || b.spent - a.spent
        case 'recientes':
          return b.last.localeCompare(a.last)
        case 'nombre':
          return (a.name || a.email).localeCompare(b.name || b.email)
        default:
          return b.spent - a.spent
      }
    })
  }, [customers, query, sort, only])

  const recurrentes = customers.filter((c) => c.orders > 1).length
  const promedio = customers.length
    ? Math.round(customers.reduce((s, c) => s + c.spent, 0) / customers.length)
    : 0

  /** Mensaje de reenganche: reconoce la compra anterior en vez de arrancar en frío. */
  const followUp = (c: CustomerRow) =>
    `¡Hola${c.name ? ` ${c.name.split(' ')[0]}` : ''}! Te escribimos de A Guantes Negros. ¿Cómo te fue con lo último que llevaste? Si necesitás reponer algo, decinos y te lo armamos.`

  const waLink = (c: CustomerRow) => (c.whatsapp ? customerWhatsappLink(c.whatsapp, followUp(c)) : null)

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Clientes</h1>
          <p className="admin-page__meta">Se arman solos con cada pedido</p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      {orders === null && !error ? (
        <p className="admin-page__meta">Cargando pedidos…</p>
      ) : customers.length === 0 ? (
        <p className="admin-alert">
          Todavía no hay clientes registrados. Se arman solos a partir de los pedidos: cada compra guarda nombre, email
          y WhatsApp para poder coordinar la entrega, el envío y el pago.
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
              <strong className="stat-card__value">{recurrentes}</strong>
              <span className="stat-card__foot">La recompra es el termómetro del rubro</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__label">Gasto promedio</span>
              <strong className="stat-card__value">{formatPrice(promedio)}</strong>
            </div>
          </div>

          <div className="admin-filters">
            <input
              className="admin-filters__search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, mail o WhatsApp…"
              aria-label="Buscar clientes"
            />
            <label className="admin-filters__field">
              Mostrar
              <select value={only} onChange={(e) => setOnly(e.target.value as typeof only)}>
                <option value="todos">Todos</option>
                <option value="recurrentes">Recurrentes (2+ compras)</option>
                <option value="una">Compraron una sola vez</option>
              </select>
            </label>
            <label className="admin-filters__field">
              Ordenar por
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="gasto-desc">Gasto: mayor a menor</option>
                <option value="gasto-asc">Gasto: menor a mayor</option>
                <option value="pedidos-desc">Más pedidos</option>
                <option value="recientes">Compra más reciente</option>
                <option value="nombre">Nombre (A–Z)</option>
              </select>
            </label>
            <p className="admin-filters__count">
              {visible.length === customers.length
                ? `${customers.length} ${customers.length === 1 ? 'cliente' : 'clientes'}`
                : `${visible.length} de ${customers.length}`}
            </p>
          </div>

          {visible.length === 0 ? (
            <p className="admin-alert">Ningún cliente coincide con los filtros.</p>
          ) : (
            <>
              <div className="admin-table-wrap admin-table-wrap--collapse">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Contacto</th>
                      <th>Zona</th>
                      <th>Pedidos</th>
                      <th>Total gastado</th>
                      <th>Última compra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((c) => {
                      const wa = waLink(c)
                      return (
                        <tr key={c.email}>
                          <td>
                            <strong>{c.name || '—'}</strong>
                          </td>
                          <td>
                            <span className="admin-table__sub">{c.email}</span>
                            {c.whatsapp &&
                              (wa ? (
                                <a href={wa} target="_blank" rel="noreferrer" className="stat-wa">
                                  {c.whatsapp} ↗
                                </a>
                              ) : (
                                <span className="admin-table__sub">{c.whatsapp}</span>
                              ))}
                          </td>
                          <td>{c.provinces.join(', ') || '—'}</td>
                          <td>{c.orders}</td>
                          <td>{formatPrice(c.spent)}</td>
                          <td>{new Date(c.last).toLocaleDateString('es-AR')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista de cards (teléfonos, tablets y ventanas angostas) */}
              <div className="admin-cards">
                {visible.map((c) => {
                  const wa = waLink(c)
                  return (
                    <article key={c.email} className="admin-card">
                      <div className="admin-card__head">
                        <strong>{c.name || '—'}</strong>
                        <span className="admin-card__sub">{c.email}</span>
                        {c.whatsapp &&
                          (wa ? (
                            <a href={wa} target="_blank" rel="noreferrer" className="stat-wa">
                              {c.whatsapp} ↗
                            </a>
                          ) : (
                            <span className="admin-card__sub">{c.whatsapp}</span>
                          ))}
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
                        {c.provinces.length > 0 && `${c.provinces.join(', ')} · `}
                        Última compra: {new Date(c.last).toLocaleDateString('es-AR')}
                      </p>
                    </article>
                  )
                })}
              </div>
            </>
          )}

          <p className="admin-page__meta">
            Son datos personales: tratalos con cuidado y no los uses para nada que la persona no haya esperado al
            comprar.
          </p>
        </>
      )}
    </div>
  )
}
