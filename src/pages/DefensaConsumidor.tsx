import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import {
  CONSUMER_AGENCIES,
  CONTACT_EMAIL,
  REVOCATION_DAYS,
  WHATSAPP_DISPLAY,
  telLink,
  whatsappLink,
} from '../data/shop'

/** Texto del pedido de arrepentimiento, con lo que el negocio necesita para
 *  identificar la compra. Se usa igual para WhatsApp y para el mail. */
function revocationMessage(f: { order: string; name: string; contact: string; reason: string }) {
  const lines = [
    'BOTÓN DE ARREPENTIMIENTO',
    'Quiero revocar la compra que hice en A Guantes Negros, dentro del plazo del artículo 34 de la Ley 24.240.',
    `Pedido: ${f.order.trim() || '(no lo tengo a mano)'}`,
    `Nombre: ${f.name.trim() || '(sin completar)'}`,
    `Contacto: ${f.contact.trim() || '(sin completar)'}`,
  ]
  if (f.reason.trim()) lines.push(`Motivo: ${f.reason.trim()}`)
  lines.push('Quedo a la espera del código de identificación de la revocación.')
  return lines.join('\n')
}

export default function DefensaConsumidor() {
  const [form, setForm] = useState({ order: '', name: '', contact: '', reason: '' })
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const msg = revocationMessage(form)
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    'Botón de arrepentimiento — revocación de compra',
  )}&body=${encodeURIComponent(msg)}`

  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <span aria-current="page">Defensa al consumidor</span>
        </nav>

        <header className="page__head">
          <div>
            <h1 className="page__title">
              Defensa al
              <br />
              consumidor
            </h1>
            <p className="page__sub">
              Tus derechos como comprador, cómo arrepentirte de una compra y dónde reclamar si con nosotros no se
              resuelve.
            </p>
          </div>
          <BrandMascot variant="question" className="page__mascot" title="Guantín con una duda" />
        </header>

        <article className="legal">
          {/* ---- BOTÓN DE ARREPENTIMIENTO (Res. 424/2020) ---- */}
          <section className="revoke" id="arrepentimiento">
            <h2 className="revoke__title">Botón de arrepentimiento</h2>
            <p className="revoke__lead">
              Tenés <strong>{REVOCATION_DAYS} días corridos</strong> desde que recibís el pedido para arrepentirte y
              devolverlo, sin costo y sin tener que explicar por qué. Completá esto y mandanos el pedido de revocación:
              no hace falta que te registres ni que hagas ningún trámite previo.
            </p>

            <div className="revoke__form">
              <label className="field">
                <span>Número de pedido</span>
                <input
                  value={form.order}
                  onChange={set('order')}
                  placeholder="AGN-1234"
                  autoComplete="off"
                  inputMode="text"
                />
                <small className="field__hint">Está en el mail y en el mensaje que nos mandaste al comprar.</small>
              </label>
              <label className="field">
                <span>Tu nombre</span>
                <input value={form.name} onChange={set('name')} placeholder="Juan Pérez" autoComplete="name" />
              </label>
              <label className="field">
                <span>Mail o WhatsApp de contacto</span>
                <input
                  value={form.contact}
                  onChange={set('contact')}
                  placeholder="juanperez@mail.com"
                  autoComplete="email"
                />
              </label>
              <label className="field">
                <span>Motivo (opcional)</span>
                <textarea
                  value={form.reason}
                  onChange={set('reason')}
                  rows={2}
                  placeholder="No hace falta que lo completes."
                />
              </label>
            </div>

            <p className="revoke__hint">
              Elegí por dónde mandarlo. Se abre con el pedido ya escrito; sólo tenés que enviarlo.
            </p>
            <div className="revoke__actions">
              <a className="btn btn--primary" href={whatsappLink(msg)} target="_blank" rel="noreferrer">
                <span className="btn__label">Enviar por WhatsApp</span>
              </a>
              <a className="btn btn--ghost" href={mailto}>
                <span className="btn__label">Enviar por mail</span>
              </a>
            </div>

            <p className="revoke__foot">
              Dentro de las <strong>24 horas</strong> y por el mismo medio por el que nos escribas, te mandamos el
              código de identificación de la revocación. Si preferís hacerlo hablando, llamanos o escribinos al{' '}
              <a href={whatsappLink()} target="_blank" rel="noreferrer">
                {WHATSAPP_DISPLAY}
              </a>{' '}
              y lo tomamos igual.
            </p>
          </section>

          <h2>Cómo es la devolución</h2>
          <ul>
            <li>
              El plazo es de <strong>{REVOCATION_DAYS} días corridos</strong> desde que recibís el producto, o desde la
              compra si es posterior.
            </li>
            <li>
              <strong>No te cuesta nada.</strong> El costo de devolver el producto lo pagamos nosotros: la ley es clara
              en que la revocación no puede implicarte ningún gasto.
            </li>
            <li>
              El producto tiene que volver <strong>sin usar y en su envase original</strong>. Los insumos estériles
              (agujas, cartuchos) sólo se pueden devolver con el empaque intacto: una vez abierto no se pueden volver a
              vender, y no sería seguro que lo hiciéramos.
            </li>
            <li>Una vez que lo recibimos, te devolvemos lo que pagaste por el mismo medio por el que pagaste.</li>
          </ul>
          <p>
            Esto es distinto de un cambio o de la garantía. Para eso, mirá las{' '}
            <Link to="/faq">preguntas frecuentes</Link> o escribinos y lo vemos.
          </p>

          <h2>Dónde reclamar si no lo resolvemos</h2>
          <p>
            Lo primero es escribirnos: casi todo se arregla hablando. Pero si no quedás conforme, tenés derecho a
            reclamar ante el organismo público que corresponda, y es gratis.
          </p>

          <div className="agencies">
            {CONSUMER_AGENCIES.map((a) => (
              <article className="agency" key={a.scope}>
                <p className="agency__scope">{a.scope}</p>
                <h3 className="agency__name">{a.name}</h3>
                <ul className="agency__phones">
                  {a.phones.map((p) => (
                    <li key={p}>
                      <a href={telLink(p)}>{p}</a>
                    </li>
                  ))}
                </ul>
                <a className="agency__site" href={a.site} target="_blank" rel="noreferrer">
                  {a.siteLabel} ↗
                </a>
                {a.email && (
                  <a className="agency__site" href={`mailto:${a.email}`}>
                    {a.email}
                  </a>
                )}
                {a.note && <p className="agency__note">{a.note}</p>}
              </article>
            ))}
          </div>

          <h2>La ley que te ampara</h2>
          <p>
            La <strong>Ley 24.240 de Defensa del Consumidor</strong> es la que fija todo esto: el derecho a
            arrepentirte dentro de los {REVOCATION_DAYS} días (artículo 34), a que la información sea cierta y clara
            (artículo 4), y a la garantía de los productos (artículos 11 a 17). El botón de arrepentimiento de arriba
            está para cumplir con la <strong>Resolución 424/2020</strong> de la Secretaría de Comercio Interior.
          </p>
          <p>
            Y si lo que te preocupa son tus datos personales, eso está en la{' '}
            <Link to="/privacidad">política de privacidad</Link>.
          </p>

          <div className="legal__foot">
            <p>¿Algo no salió como esperabas? Escribinos primero, lo resolvemos.</p>
            <a className="btn btn--primary" href={whatsappLink()} target="_blank" rel="noreferrer">
              <span className="btn__label">Escribinos por WhatsApp</span>
            </a>
          </div>
        </article>
      </div>
    </main>
  )
}
