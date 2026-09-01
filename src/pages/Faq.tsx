import { Link } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import { whatsappLink } from '../data/shop'
import { FAQS } from '../data/catalog'
import { Accordion, Button, Reveal } from '../components/ui'

export default function Faq() {
  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <span aria-current="page">Preguntas frecuentes</span>
        </nav>
        <header className="page__head">
          <div>
            <h1 className="page__title">
              Preguntas
              <br />
              frecuentes
            </h1>
            <p className="page__sub">Respondemos las dudas más comunes para que compres con confianza.</p>
          </div>
          <BrandMascot variant="question" className="page__mascot" title="Guantín con un signo de pregunta" />
        </header>

        <div className="faq-list">
          {FAQS.map(([q, a], i) => (
            <Reveal key={q} delay={i * 50}>
              <Accordion title={q} defaultOpen={i === 0}>
                <p>{a}</p>
              </Accordion>
            </Reveal>
          ))}
        </div>

        <div className="faq-cta">
          <p>¿No encontraste lo que buscabas?</p>
          <a className="btn btn--primary" href={whatsappLink()} target="_blank" rel="noreferrer">
            <span className="btn__label">Escribinos por WhatsApp</span>
          </a>
        </div>
      </div>
    </main>
  )
}
