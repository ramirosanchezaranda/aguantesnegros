import { Link } from 'react-router-dom'
import { stockOf, type Product } from '../data/catalog'
import { formatPrice } from '../lib/format'
import { useCart } from '../context/CartContext'
import ProductArt from './ProductArt'
import { CartIcon } from './ui'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const soldOut = stockOf(product) <= 0
  return (
    <article className={`pcard ${soldOut ? 'pcard--out' : ''}`}>
      <Link to={`/producto/${product.slug}`} className="pcard__media" aria-label={product.name}>
        {soldOut ? (
          <span className="pcard__badge pcard__badge--out">Agotado</span>
        ) : (
          product.badge && <span className="pcard__badge">{product.badge}</span>
        )}
        <ProductArt category={product.category} className="pcard__art" />
      </Link>
      <div className="pcard__body">
        <p className="pcard__brand">{product.brand}</p>
        <h3 className="pcard__name">
          <Link to={`/producto/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="pcard__row">
          <p className="pcard__price">
            {product.compareAt && <s>{formatPrice(product.compareAt)}</s>}
            {formatPrice(product.price)}
          </p>
          <button
            className="pcard__buy"
            onClick={() => add(product.slug)}
            disabled={soldOut}
            aria-label={soldOut ? `${product.name} sin stock` : `Agregar ${product.name} al carrito`}
          >
            <CartIcon />
          </button>
        </div>
      </div>
    </article>
  )
}
