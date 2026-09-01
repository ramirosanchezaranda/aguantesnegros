import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import ProductArt from '../components/ProductArt'
import { useCart } from '../context/CartContext'
import { useMascotMood } from '../context/MascotMoodContext'
import { formatPrice, installments } from '../lib/format'
import { saveOrder } from '../lib/orders'
import { markCartConverted } from '../lib/carts'
import { Button } from '../components/ui'

const STEPS = ['Datos', 'Envío', 'Pago', 'Confirmación']

export default function Checkout() {
  const { entries, total, discount, shipping, grandTotal, coupon, clear } = useCart()
  const { pulse } = useMascotMood()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  // B3: order number generated once, never re-created on re-render
  const orderNum = useRef(`AGN-${Math.floor(1000 + Math.random() * 9000)}`)

  if (entries.length === 0 && !done) return <Navigate to="/carrito" replace />

  const next = (e: FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      setStep(step + 1)
      return
    }
    // Se registra el pedido antes de vaciar el carrito, que es de donde salen
    // las líneas. Si el registro falla no se bloquea la compra: el cliente ya
    // llegó al final, y perder una estadística es preferible a frenarlo.
    void saveOrder({
      id: orderNum.current,
      createdAt: new Date().toISOString(),
      items: entries.map(({ product, qty }) => ({
        slug: product.slug,
        name: product.name,
        price: product.price,
        cost: product.cost,
        qty,
        category: product.category,
      })),
      subtotal: total,
      discount,
      shipping,
      total: grandTotal,
      coupon: coupon ?? undefined,
    }).catch(() => {
      /* el pedido se muestra igual; sólo se pierde el registro */
    })
    // Este carrito terminó en compra: deja de contar como abandonado.
    void markCartConverted()
    setStep(3)
    setDone(true)
    clear()
    pulse('excited', 4000)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  if (done) {
    return (
      <main className="page">
        <div className="container checkout-done">
          <BrandMascot variant="rock" className="checkout-done__mascot" title="Guantín festejando tu compra" />
          <p className="checkout-done__eyebrow">Pedido #{orderNum.current}</p>
          <h1 className="page__title">¡Gracias, crack!</h1>
          <p className="page__sub">
            Tu pedido ya está en manos de Guantín. Te mandamos la confirmación y el seguimiento por mail y WhatsApp.
          </p>
          <Button to="/" arrow>
            Volver al inicio
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <Link to="/carrito">Carrito</Link> <span>/</span>{' '}
          <span aria-current="page">Finalizar compra</span>
        </nav>

        <ol className="steps" aria-label="Pasos del checkout">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'steps__item steps__item--on' : i < step ? 'steps__item steps__item--done' : 'steps__item'}>
              <span className="steps__num">{i < step ? '✓' : i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="checkout">
          <form className="checkout__form" onSubmit={next}>
            {step === 0 && (
              <fieldset>
                <legend>Datos personales</legend>
                <label className="field">
                  <span>Nombre completo*</span>
                  <input required autoComplete="name" placeholder="Juan Pérez" />
                </label>
                <label className="field">
                  <span>Email*</span>
                  <input required type="email" autoComplete="email" placeholder="juanperez@mail.com" />
                </label>
                <label className="field">
                  <span>Teléfono*</span>
                  <input required type="tel" autoComplete="tel" placeholder="11 1234 5678" />
                </label>
              </fieldset>
            )}
            {step === 1 && (
              <fieldset>
                <legend>Dirección de envío</legend>
                <div className="field-row">
                  <label className="field">
                    <span>Provincia*</span>
                    <select required defaultValue="Buenos Aires">
                      {['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Otra'].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Ciudad*</span>
                    <input required placeholder="La Plata" />
                  </label>
                </div>
                <label className="field">
                  <span>Dirección*</span>
                  <input required autoComplete="street-address" placeholder="Calle 123 #456" />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Código postal*</span>
                    <input required autoComplete="postal-code" placeholder="1900" />
                  </label>
                  <label className="field">
                    <span>Depto / Piso</span>
                    <input placeholder="Opcional" />
                  </label>
                </div>
              </fieldset>
            )}
            {step === 2 && (
              <fieldset>
                <legend>Pago</legend>
                <label className="field">
                  <span>Número de tarjeta*</span>
                  <input required inputMode="numeric" placeholder="4242 4242 4242 4242" />
                </label>
                <label className="field">
                  <span>Nombre en la tarjeta*</span>
                  <input required placeholder="JUAN PEREZ" />
                </label>
                <div className="field-row">
                  <label className="field">
                    <span>Vencimiento*</span>
                    <input required placeholder="MM/AA" />
                  </label>
                  <label className="field">
                    <span>CVV*</span>
                    <input required inputMode="numeric" placeholder="123" />
                  </label>
                </div>
                <label className="field">
                  <span>Cuotas</span>
                  <select defaultValue="3">
                    <option value="1">1 pago de {formatPrice(grandTotal)}</option>
                    <option value="3">{installments(grandTotal)}</option>
                  </select>
                </label>
              </fieldset>
            )}

            <div className="checkout__actions">
              {step > 0 && (
                <button type="button" className="checkout__back" onClick={() => setStep(step - 1)}>
                  ← Volver
                </button>
              )}
              <Button variant="red" type="submit" className="checkout__next">
                {step === 2 ? 'Confirmar pedido' : step === 1 ? 'Continuar con pago' : 'Continuar con envío'}
              </Button>
            </div>
          </form>

          <aside className="summary summary--sticky">
            <h2>Resumen del pedido</h2>
            <ul className="summary__items">
              {entries.map(({ product, qty }) => (
                <li key={product.slug}>
                  <span className="summary__thumb">
                    <ProductArt product={product} />
                  </span>
                  <span className="summary__item-name">
                    {product.name}
                    <em>x{qty}</em>
                  </span>
                  <span>{formatPrice(product.price * qty)}</span>
                </li>
              ))}
            </ul>
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
          </aside>
        </div>
      </div>
    </main>
  )
}
