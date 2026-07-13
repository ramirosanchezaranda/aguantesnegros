import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import ProductCard from '../components/ProductCard'
import { Reveal } from '../components/ui'
import { useCatalog } from '../context/CatalogContext'
import NotFound from './NotFound'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'rating'

export default function Category() {
  const { slug = '' } = useParams()
  const [sort, setSort] = useState<Sort>('featured')
  const { getCategory, productsByCategory } = useCatalog()
  const category = getCategory(slug)
  if (!category) return <NotFound />

  const products = [...productsByCategory(slug)].sort((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating || b.reviews - a.reviews
      default:
        return Number(b.featured ?? false) - Number(a.featured ?? false)
    }
  })

  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <Link to="/categorias">Categorías</Link> <span>/</span>{' '}
          <span aria-current="page">{category.name}</span>
        </nav>
        <header className="page__head">
          <div>
            <h1 className="page__title">{category.name}</h1>
            <p className="page__sub">{category.tagline}. Marcas originales, stock real.</p>
          </div>
          <BrandMascot variant={category.mascot} className="page__mascot" title={`Guantín — ${category.name}`} />
        </header>

        <div className="toolbar">
          <p className="toolbar__count">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </p>
          <label className="toolbar__sort">
            Ordenar por
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="rating">Mejor puntuados</option>
            </select>
          </label>
        </div>

        <div className="prodgrid prodgrid--page">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 50}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
