import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { getRepo, resetLocalCatalog } from '../../lib/catalog'
import { hasSupabase } from '../../lib/supabase'
import { stockOf, type Product } from '../../data/catalog'
import { formatPrice } from '../../lib/format'
import ProductArt from '../../components/ProductArt'

export default function AdminProducts() {
  const { products, categories, reload, loading, error } = useCatalog()
  const [busy, setBusy] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

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
      await getRepo().deleteProduct(product.slug)
      await reload()
      setMsg(`"${product.name}" eliminado.`)
    } catch (e) {
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

  const lowStock = products.filter((p) => stockOf(p) <= 5).length

  const stockInput = (p: Product) => {
    const stock = stockOf(p)
    return (
      <input
        type="number"
        min={0}
        defaultValue={stock}
        className={`admin-stock ${stock <= 0 ? 'admin-stock--out' : stock <= 5 ? 'admin-stock--low' : ''}`}
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

      <div className="admin-table-wrap">
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
            {products.map((p) => {
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
        {products.map((p) => (
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
