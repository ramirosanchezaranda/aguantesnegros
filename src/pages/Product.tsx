import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import ProductArt from '../components/ProductArt'
import ProductCard from '../components/ProductCard'
import { stockOf } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { formatPrice, installments } from '../lib/format'
import { Accordion, BadgeIcon, Button, CardIcon, Reveal, Stars, TruckIcon } from '../components/ui'
import NotFound from './NotFound'

export default function Product() {
  const { slug = '' } = useParams()
  const { getProduct, getCategory, productsByCategory } = useCatalog()
  const product = getProduct(slug)
  const { add } = useCart()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [shot, setShot] = useState(0)

  if (!product) return <NotFound />
  const category = getCategory(product.category)
  const related = productsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4)
  const stock = stockOf(product)
  const soldOut = stock <= 0
  // Con fotos cargadas la galería tiene una miniatura por foto; sin ellas,
  // las tres vistas decorativas de siempre.
  const hasPhotos = (product.images?.length ?? 0) > 0
  const shots = hasPhotos ? product.images!.length : 3

  return (
    <main className="page" key={product.slug}>
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span>{' '}
          <Link to={`/categoria/${product.category}`}>{category?.name}</Link> <span>/</span>{' '}
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="pdp">
          {/* Galería */}
          <div className="pdp__gallery">
            <div className="pdp__thumbs">
              {Array.from({ length: shots }, (_, i) => (
                <button
                  key={i}
                  className={`pdp__thumb ${shot === i ? 'pdp__thumb--on' : ''}`}
                  onClick={() => setShot(i)}
                  aria-label={`Vista ${i + 1}`}
                >
                  <ProductArt product={product} index={i} />
                </button>
              ))}
            </div>
            <div className="pdp__stage">
              {product.badge && <span className="pcard__badge">{product.badge}</span>}
              <ProductArt
                product={product}
                index={shot}
                // Sin fotos, las "vistas" son la misma ilustración rotada; con
                // fotos reales cada una es distinta y no hay que inclinarlas.
                className={`pdp__art ${hasPhotos ? '' : `pdp__art--${shot}`}`}
              />
            </div>
          </div>

          {/* Info */}
          <div className="pdp__info">
            <p className="pdp__brand">{product.brand}</p>
            <h1 className="pdp__name">{product.name}</h1>
            <p className="pdp__rating">
              <Stars rating={product.rating} /> <span>({product.reviews} reseñas)</span>
            </p>
            <p className="pdp__price">
              {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
              {formatPrice(product.price)}
            </p>
            <p className="pdp__installments">{installments(product.price)}</p>

            <p className={`pdp__stock ${soldOut ? 'pdp__stock--out' : stock <= 5 ? 'pdp__stock--low' : ''}`}>
              {soldOut ? 'Agotado' : stock <= 5 ? `¡Últimas ${stock} unidades!` : 'En stock'}
            </p>

            {product.colors?.length ? (
              <div className="pdp__colors">
                <span className="pdp__colors-label">
                  {product.colors.length === 1 ? 'Color' : `${product.colors.length} colores`}
                </span>
                <ul>
                  {product.colors.map((hex) => (
                    <li key={hex} style={{ background: hex }} title={hex}>
                      <span className="sr-only">{hex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <ul className="pdp__perks">
              {product.specs.slice(0, 4).map(([k, v]) => (
                <li key={k}>
                  <strong>{k}</strong> {v}
                </li>
              ))}
            </ul>

            <div className="pdp__buy">
              <div className="qty">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Restar" disabled={soldOut}>
                  −
                </button>
                <span aria-live="polite">{qty}</span>
                <button onClick={() => setQty(Math.min(stock, qty + 1))} aria-label="Sumar" disabled={soldOut || qty >= stock}>
                  +
                </button>
              </div>
              <Button variant="red" className="pdp__cta" onClick={() => add(product.slug, qty)} disabled={soldOut}>
                {soldOut ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
            </div>
            <Button
              variant="ghost"
              className="pdp__now"
              disabled={soldOut}
              onClick={() => {
                add(product.slug, qty)
                navigate('/checkout')
              }}
            >
              Comprar ahora
            </Button>

            <div className="pdp__mascot-tip" aria-hidden="true">
              <BrandMascot variant="pointing" className="pdp__mascot" title="Guantín recomendando el producto" />
              <span className="pdp__tip-bubble">¡Llevalo, no te vas a arrepentir!</span>
            </div>

            <div className="pdp__benefits">
              <p>
                <TruckIcon /> Envíos a todo el país
              </p>
              <p>
                <CardIcon /> 3 cuotas sin interés
              </p>
              <p>
                <BadgeIcon /> Producto original
              </p>
            </div>

            <div className="pdp__accordions">
              <Accordion title="Descripción" defaultOpen>
                <p>{product.description}</p>
              </Accordion>
              <Accordion title="Especificaciones">
                <table className="spec-table">
                  <tbody>
                    {product.specs.map(([k, v]) => (
                      <tr key={k}>
                        <th scope="row">{k}</th>
                        <td>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>
              <Accordion title="Envíos y devoluciones">
                <p>
                  Despachamos en 24 hs hábiles. En AMBA llega en 24–48 hs; al interior, entre 2 y 5 días. Tenés 30 días para cambios de
                  productos sin abrir.
                </p>
              </Accordion>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="section section--flush">
            <Reveal className="section__head">
              <h2 className="section__title">También te puede servir</h2>
            </Reveal>
            <div className="prodgrid">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
