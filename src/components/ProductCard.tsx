import { Link } from 'react-router-dom'
import type { Product } from '../data/catalog'
import { formatPrice } from '../lib/format'
import { useCart } from '../context/CartContext'
import ProductArt from './ProductArt'
import { CartIcon } from './ui'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  return (
    <article className="pcard">
      <Link to={`/producto/${product.slug}`} className="pcard__media" aria-label={product.name}>
        {product.badge && <span className="pcard__badge">{product.badge}</span>}
        <ProductArt kind={product.art} className="pcard__art" />
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
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <CartIcon />
          </button>
        </div>
      </div>
    </article>
  )
}
