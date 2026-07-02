import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Mascot from '../components/mascot/Mascot'
import ProductArt from '../components/ProductArt'
import { useCart } from '../context/CartContext'
import { useMascotMood } from '../context/MascotMoodContext'
import { formatPrice } from '../lib/format'
import { Button } from '../components/ui'

export default function Cart() {
  const { entries, total, setQty, remove } = useCart()
  const { setBaseMood } = useMascotMood()
  const [code, setCode] = useState('')
  const [applied, setApplied] = useState(false)
  const empty = entries.length === 0

  // El logo se pone triste si el carrito está vacío.
  useEffect(() => {
    setBaseMood(empty ? 'sad' : 'happy')
    return () => setBaseMood('happy')
  }, [empty, setBaseMood])

  const discount = applied ? Math.round(total * 0.1) : 0

  if (empty) {
    return (
      <main className="page">
        <div className="container cart-empty">
          <Mascot variant="question" className="cart-empty__mascot" title="Guantín con el carrito vacío" />
          <h1 className="page__title">Tu carrito está vacío</h1>
          <p className="page__sub">Y Guantín está triste. Dale una alegría: hay máquinas, tintas y agujas esperándote.</p>
          <Button to="/categorias" arrow>
            Ver productos
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <span aria-current="page">Carrito de compras</span>
        </nav>
        <header className="page__head">
          <div>
            <h1 className="page__title">Tu carrito</h1>
            <p className="page__sub">Revisá los productos que seleccionaste.</p>
          </div>
          <Mascot variant="cart" className="page__mascot page__mascot--cart" title="Guantín empujando el carrito" />
        </header>

        <div className="cart">
          <div className="cart__list">
            <div className="cart__row cart__row--head" aria-hidden="true">
              <span>Producto</span>
              <span>Precio</span>
              <span>Cantidad</span>
              <span>Subtotal</span>
              <span />
            </div>
            {entries.map(({ product, qty }) => (
              <div className="cart__row" key={product.slug}>
                <div className="cart__product">
                  <Link to={`/producto/${product.slug}`} className="cart__thumb">
                    <ProductArt kind={product.art} />
                  </Link>
                  <div>
                    <p className="cart__brand">{product.brand}</p>
                    <Link to={`/producto/${product.slug}`} className="cart__name">
                      {product.name}
                    </Link>
                  </div>
                </div>
                <p className="cart__price" data-label="Precio">
                  {formatPrice(product.price)}
                </p>
                <div className="qty qty--sm" data-label="Cantidad">
                  <button onClick={() => setQty(product.slug, qty - 1)} aria-label="Restar">
                    −
                  </button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(product.slug, qty + 1)} aria-label="Sumar">
                    +
                  </button>
                </div>
                <p className="cart__subtotal" data-label="Subtotal">
                  {formatPrice(product.price * qty)}
                </p>
                <button className="cart__remove" onClick={() => remove(product.slug)} aria-label={`Quitar ${product.name}`}>
                  ×
                </button>
              </div>
            ))}

            <div className="cart__coupon">
              <input
                type="text"
                placeholder="Código de descuento"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                aria-label="Código de descuento"
              />
              <button
                className="btn btn--primary"
                onClick={() => setApplied(code.trim().toUpperCase() === 'GUANTIN10')}
              >
                <span className="btn__label">Aplicar</span>
              </button>
              {applied && <p className="cart__coupon-ok">¡GUANTIN10 aplicado! −10%</p>}
            </div>

            <Link to="/categorias" className="cart__continue">
              ← Seguir comprando
            </Link>
          </div>

          <aside className="summary">
            <h2>Resumen</h2>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
              {applied && (
                <div className="summary__discount">
                  <dt>Descuento</dt>
                  <dd>−{formatPrice(discount)}</dd>
                </div>
              )}
              <div>
                <dt>Envío</dt>
                <dd>{total - discount >= 50000 ? 'Gratis' : formatPrice(6990)}</dd>
              </div>
              <div className="summary__total">
                <dt>Total</dt>
                <dd>{formatPrice(total - discount + (total - discount >= 50000 ? 0 : 6990))}</dd>
              </div>
            </dl>
            <Button to="/checkout" variant="red" className="summary__cta">
              Finalizar compra
            </Button>
            <p className="summary__note">3 cuotas sin interés con tarjetas seleccionadas.</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
