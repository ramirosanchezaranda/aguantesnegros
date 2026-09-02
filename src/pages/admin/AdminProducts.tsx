import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { getRepo, resetLocalCatalog } from '../../lib/catalog'
import { hasSupabase } from '../../lib/supabase'
import { stockOf, type Product } from '../../data/catalog'
import { formatPrice } from '../../lib/format'
import ProductArt from '../../components/ProductArt'

/** Umbral de "stock bajo", compartido por el aviso y el filtro. */
const LOW_STOCK = 5

type StockFilter = 'todos' | 'agotados' | 'bajos' | 'con-stock'
type Sort =
  | 'nombre'
  | 'precio-asc'
  | 'precio-desc'
  | 'stock-asc'
  | 'stock-desc'
  | 'valor-desc'
  | 'margen-desc'
  | 'destacados'

export default function AdminProducts() {
  const { products, categories, reload, loading, error } = useCatalog()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('todas')
  const [stockFilter, setStockFilter] = useState<StockFilter>('todos')
  const [sort, setSort] = useState<Sort>('nombre')

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug

  async function commitStock(product: Product, raw: string) {
    const next = Math.max(0, Math.round(Number(raw)))
    if (!Number.isFinite(next) || next === stockOf(product)) return
    setBusy(product.slug)
    try {
      await getRepo().saveProduct({ ...product, stock: next })
      await reload()
      setMsg(`Stock de "${product.name}" actualizado a ${next}.`)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo guardar el stock')
    } finally {
      setBusy(null)
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    setBusy(product.slug)
    try {
      console.log('1. Eliminando...')
      await getRepo().deleteProduct(product.slug)
      console.log('2. Delete completado, recargando...')
      await reload()
      console.log('3. Reload completado')
      setMsg(`"${product.name}" eliminado.`)
    } catch (e) {
      console.error('Error en remove():', e)
      setMsg(e instanceof Error ? e.message : 'No se pudo eliminar')
    } finally {
      setBusy(null)
    }
  }

  async function resetSeed() {
    if (!window.confirm('Restaurar el catálogo semilla. Se perderán los cambios locales. ¿Continuar?')) return
    resetLocalCatalog()
    await reload()
    setMsg('Catálogo restaurado a la versión semilla.')
  }

  const lowStock = products.filter((p) => stockOf(p) <= LOW_STOCK).length

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((p) => {
      if (q && !`${p.name} ${p.brand}`.toLowerCase().includes(q)) return false
      if (category !== 'todas' && p.category !== category) return false
      const stock = stockOf(p)
      if (stockFilter === 'agotados' && stock > 0) return false
      if (stockFilter === 'bajos' && (stock === 0 || stock > LOW_STOCK)) return false
      if (stockFilter === 'con-stock' && stock <= 0) return false
      return true
    })
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'precio-asc':
          return a.price - b.price
        case 'precio-desc':
          return b.price - a.price
        case 'stock-asc':
          return stockOf(a) - stockOf(b)
        case 'stock-desc':
          return stockOf(b) - stockOf(a)
        case 'valor-desc':
          return b.price * stockOf(b) - a.price * stockOf(a)
        case 'margen-desc': {
          // Los productos sin costo van al final: su margen es desconocido,
          // no cero, y mezclarlos arriba daría una lectura falsa.
          const m = (x: Product) => (typeof x.cost === 'number' ? x.price - x.cost : -Infinity)
          return m(b) - m(a)
        }
        case 'destacados':
          return Number(!!b.featured) - Number(!!a.featured) || a.name.localeCompare(b.name)
        default:
          return a.name.localeCompare(b.name)
      }
    })
  }, [products, query, category, stockFilter, sort])

  const filtrando = query.trim() !== '' || category !== 'todas' || stockFilter !== 'todos'

  const stockInput = (p: Product) => {
    const stock = stockOf(p)
    return (
      <input
        type="number"
        min={0}
        defaultValue={stock}
        className={`admin-stock ${stock <= 0 ? 'admin-stock--out' : stock <= LOW_STOCK ? 'admin-stock--low' : ''}`}
        onBlur={(e) => commitStock(p, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
        }}
        aria-label={`Stock de ${p.name}`}
      />
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Productos</h1>
          <p className="admin-page__meta">
            {products.length} productos · {lowStock > 0 ? `${lowStock} con stock bajo` : 'stock saludable'}
          </p>
        </div>
        <div className="admin-page__actions">
          {!hasSupabase() && (
            <button className="admin-btn admin-btn--ghost" onClick={resetSeed}>
              Restaurar semilla
            </button>
          )}
          <Link to="/admin/productos/nuevo" className="admin-btn admin-btn--primary">
            + Nuevo producto
          </Link>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {msg && <p className="admin-alert">{msg}</p>}
      {loading && <p className="admin-page__meta">Cargando…</p>}

      <div className="admin-filters">
        <input
          className="admin-filters__search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o marca…"
          aria-label="Buscar productos"
        />
        <label className="admin-filters__field">
          Categoría
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="todas">Todas</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-filters__field">
          Stock
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as StockFilter)}>
            <option value="todos">Todos</option>
            <option value="agotados">Agotados</option>
            <option value="bajos">Stock bajo (≤ {LOW_STOCK})</option>
            <option value="con-stock">Con stock</option>
          </select>
        </label>
        <label className="admin-filters__field">
          Ordenar por
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="nombre">Nombre (A–Z)</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="stock-asc">Stock: menor a mayor</option>
            <option value="stock-desc">Stock: mayor a menor</option>
            <option value="valor-desc">Valor en stock</option>
            <option value="margen-desc">Margen: mayor a menor</option>
            <option value="destacados">Destacados primero</option>
          </select>
        </label>
        {filtrando && (
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => {
              setQuery('')
              setCategory('todas')
              setStockFilter('todos')
            }}
          >
            Limpiar
          </button>
        )}
        <p className="admin-filters__count">
          {visible.length === products.length
            ? `${products.length} productos`
            : `${visible.length} de ${products.length}`}
        </p>
      </div>

      {visible.length === 0 && <p className="admin-alert">Ningún producto coincide con los filtros.</p>}

      <div className="admin-table-wrap admin-table-wrap--collapse">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Destacado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => {
              return (
                <tr key={p.slug} className={busy === p.slug ? 'admin-row--busy' : ''}>
                  <td>
                    <strong>{p.name}</strong>
                    <span className="admin-table__sub">{p.brand}</span>
                  </td>
                  <td>{categoryName(p.category)}</td>
                  <td>{formatPrice(p.price)}</td>
                  <td>{stockInput(p)}</td>
                  <td>{p.featured ? '★' : '—'}</td>
                  <td className="admin-table__row-actions">
                    <Link to={`/admin/productos/${p.slug}`} className="admin-btn admin-btn--sm">
                      Editar
                    </Link>
                    <button
                      className="admin-btn admin-btn--sm admin-btn--danger"
                      onClick={() => remove(p)}
                      disabled={busy === p.slug}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Vista de cards (mobile) */}
      <div className="admin-cards">
        {visible.map((p) => (
          <article key={p.slug} className={`admin-card ${busy === p.slug ? 'admin-row--busy' : ''}`}>
            <div className="admin-card__top">
              <span className="admin-card__thumb">
                <ProductArt product={p} />
              </span>
              <div className="admin-card__head">
                <strong>{p.name}</strong>
                <span className="admin-card__sub">
                  {p.brand} · {categoryName(p.category)}
                </span>
                {p.featured && <span className="admin-card__star">★ Destacado</span>}
              </div>
            </div>
            <div className="admin-card__grid">
              <div className="admin-card__field">
                <span>Precio</span>
                <span className="admin-card__value">{formatPrice(p.price)}</span>
              </div>
              <label className="admin-card__field">
                <span>Stock</span>
                {stockInput(p)}
              </label>
            </div>
            <div className="admin-card__actions">
              <Link to={`/admin/productos/${p.slug}`} className="admin-btn admin-btn--sm admin-btn--white">
                Editar
              </Link>
              <button
                className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => remove(p)}
                disabled={busy === p.slug}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
