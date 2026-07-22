import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Guantin from '../components/mascot/Guantin'
import ProductArt from '../components/ProductArt'
import { useCart } from '../context/CartContext'
import { useMascotMood } from '../context/MascotMoodContext'
import { formatPrice } from '../lib/format'
import { Button } from '../components/ui'

export default function Cart() {
  const { entries, total, discount, shipping, grandTotal, coupon, applyCoupon, removeCoupon, setQty, remove } = useCart()
  const { setBaseMood } = useMascotMood()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const empty = entries.length === 0

  useEffect(() => {
    setBaseMood(empty ? 'sad' : 'happy')
    return () => setBaseMood('happy')
  }, [empty, setBaseMood])

  const handleApply = () => {
    if (!code.trim()) return
    const ok = applyCoupon(code)
    setError(!ok)
    if (ok) setCode('')
  }

  if (empty) {
    return (
      <main className="page">
        <div className="container cart-empty">
          <Guantin face="sad" className="cart-empty__mascot" title="Guantín con el carrito vacío" />
          <h1 className="page__title">Tu carrito está vacío</h1>
          <p className="page__sub">Y Guantín está triste. Dale una alegría: hay cartuchos, tintas y agujas esperándote.</p>
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
          <Guantin face="happy" className="page__mascot page__mascot--cart" title="Guantín con tu carrito" />
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
              {coupon ? (
                <p className="cart__coupon-ok">
                  ¡{coupon} aplicado! −10%{' '}
                  <button className="cart__coupon-remove" onClick={removeCoupon} aria-label="Quitar cupón">
                    ×
                  </button>
                </p>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Código de descuento"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(false) }}
                    aria-label="Código de descuento"
                    aria-invalid={error}
                  />
                  <button className="btn btn--primary" onClick={handleApply}>
                    <span className="btn__label">Aplicar</span>
                  </button>
                  {error && <p className="cart__coupon-error">Código inválido</p>}
                </>
              )}
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
              {discount > 0 && (
                <div className="summary__discount">
                  <dt>Descuento ({coupon})</dt>
                  <dd>−{formatPrice(discount)}</dd>
                </div>
              )}
              <div>
                <dt>Envío</dt>
                <dd>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</dd>
              </div>
              <div className="summary__total">
                <dt>Total</dt>
                <dd>{formatPrice(grandTotal)}</dd>
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
