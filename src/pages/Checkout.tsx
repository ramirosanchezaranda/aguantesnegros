import { useRef, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import ProductArt from '../components/ProductArt'
import { useCart } from '../context/CartContext'
import { useMascotMood } from '../context/MascotMoodContext'
import { formatPrice, installments } from '../lib/format'
import { saveOrder } from '../lib/orders'
import { markCartConverted } from '../lib/carts'
import { getPaymentMethod, PAYMENT_METHODS, PROVINCES, whatsappLink } from '../data/shop'
import { Button } from '../components/ui'

const STEPS = ['Datos', 'Envío', 'Pago', 'Confirmación']

export default function Checkout() {
  const { entries, total, discount, shipping, grandTotal, coupon, clear } = useCart()
  const { pulse } = useMascotMood()
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  // Los datos de contacto ya no son opcionales: el pago y la entrega se
  // terminan de coordinar por WhatsApp, así que sin eso no hay pedido.
  const [customer, setCustomer] = useState({ name: '', email: '', whatsapp: '' })
  const [address, setAddress] = useState({ province: 'Buenos Aires', city: '', street: '', zip: '' })
  const [payment, setPayment] = useState(PAYMENT_METHODS[0].id)
  // El carrito se vacía al confirmar, así que el total se congela acá: si no,
  // la pantalla final y el mensaje de WhatsApp dirían $0.
  const [placedTotal, setPlacedTotal] = useState(0)
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
      customer: { ...customer },
      paymentMethod: payment,
      // Siempre: provincia y ciudad valen aunque el envío sea a sucursal o
      // punto de encuentro, y son lo que permite ver de dónde compran.
      address: { ...address },
    }).catch(() => {
      /* el pedido se muestra igual; sólo se pierde el registro */
    })
    // Este carrito terminó en compra: deja de contar como abandonado.
    void markCartConverted()
    setPlacedTotal(grandTotal)
    setStep(3)
    setDone(true)
    clear()
    pulse('excited', 4000)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  if (done) {
    const chosen = getPaymentMethod(payment)
    // El mensaje lleva la dirección completa: con eso alcanza para cotizar el
    // envío sin tener que volver a preguntársela a la persona.
    const msg = [
      `¡Hola! Acabo de hacer el pedido ${orderNum.current} por ${formatPrice(placedTotal)}.`,
      `Forma de pago: ${chosen?.label}.`,
      `Envío a: ${address.street}, ${address.city} (CP ${address.zip}), ${address.province}.`,
      `A nombre de ${customer.name}.`,
    ].join(' ')
    return (
      <main className="page">
        <div className="container checkout-done">
          <BrandMascot variant="rock" className="checkout-done__mascot" title="Guantín festejando tu compra" />
          <p className="checkout-done__eyebrow">Pedido #{orderNum.current}</p>
          <h1 className="page__title">¡Gracias, crack!</h1>
          <p className="page__sub">{chosen?.next}</p>
          <p className="checkout-done__summary">
            <strong>{formatPrice(placedTotal)}</strong> · Envío a {address.street}, {address.city} (CP {address.zip}),{' '}
            {address.province}
          </p>
          <p className="checkout-done__next">
            El costo del envío todavía no está incluido: te pasamos las opciones que llegan a tu zona con el precio
            real y elegís la que te convenga. Tocá el botón y nos llega tu pedido con todos los datos ya cargados.
          </p>
          <a className="btn btn--primary" href={whatsappLink(msg)} target="_blank" rel="noreferrer">
            <span className="btn__label">Enviar el pedido por WhatsApp</span>
          </a>
          <Button to="/" variant="ghost">
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
          {/* Acá se escriben nombre, teléfono, dirección y tarjeta: nunca se graba. */}
          <form className="checkout__form" onSubmit={next} data-clarity-mask="true">
            {step === 0 && (
              <fieldset>
                <legend>Datos de contacto</legend>
                <label className="field">
                  <span>Nombre completo*</span>
                  <input
                    required
                    autoComplete="name"
                    placeholder="Juan Pérez"
                    value={customer.name}
                    onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Email*</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="juanperez@mail.com"
                    value={customer.email}
                    onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>WhatsApp*</span>
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="11 3696 2811"
                    value={customer.whatsapp}
                    onChange={(e) => setCustomer((c) => ({ ...c, whatsapp: e.target.value }))}
                  />
                  <small className="field__hint">Por acá coordinamos la entrega y el pago.</small>
                </label>
              </fieldset>
            )}
            {step === 1 && (
              <fieldset>
                <legend>Dirección de envío</legend>
                <p className="checkout__note checkout__note--lead">
                  El envío lo coordinamos por WhatsApp: apenas confirmes el pedido te pasamos las
                  opciones que llegan a tu zona con el costo real, y elegís la que más te sirva
                  (a domicilio, a sucursal o punto de encuentro). Por eso el total de acá abajo
                  todavía no incluye el envío.
                </p>
                <p className="checkout__note">
                  Dejanos la dirección completa igual: es lo que necesitamos para cotizar y
                  despachar sin volver a escribirte.
                </p>

                <div className="field-row">
                  <label className="field">
                    <span>Provincia*</span>
                    <select
                      required
                      value={address.province}
                      onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                    >
                      {PROVINCES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Ciudad*</span>
                    <input
                      required
                      autoComplete="address-level2"
                      placeholder="La Plata"
                      value={address.city}
                      onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Dirección*</span>
                  <input
                    required
                    autoComplete="street-address"
                    placeholder="Calle 123, piso 4 depto B"
                    value={address.street}
                    onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Código postal*</span>
                  <input
                    required
                    autoComplete="postal-code"
                    placeholder="1900"
                    value={address.zip}
                    onChange={(e) => setAddress((a) => ({ ...a, zip: e.target.value }))}
                  />
                </label>
              </fieldset>
            )}
            {step === 2 && (
              <fieldset>
                <legend>Forma de pago</legend>
                <div className="choices">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.id} className={`choice ${payment === m.id ? 'choice--on' : ''}`}>
                      <input
                        type="radio"
                        name="pago"
                        value={m.id}
                        checked={payment === m.id}
                        onChange={() => setPayment(m.id)}
                      />
                      <span className="choice__body">
                        <strong>{m.label}</strong>
                        <small>{m.detail}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="checkout__note">{getPaymentMethod(payment)?.next}</p>
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

            {/* Aviso de privacidad al pie del formulario: se lee donde se
                cargan los datos, no escondido en el footer. */}
            <p className="checkout__privacy">
              * Usamos tus datos sólo para mandarte el pedido y coordinar el pago. No los vendemos ni los compartimos
              con nadie más que el correo que lleva el paquete, y no guardamos datos de tarjeta. Podés pedirnos que los
              borremos cuando quieras: <Link to="/privacidad">política de privacidad</Link>.
            </p>
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
                <dd className="summary__pending">A coordinar por WhatsApp</dd>
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
