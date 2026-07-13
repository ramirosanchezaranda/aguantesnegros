import { Link } from 'react-router-dom'
import { MascotImage } from './mascot/Mascot'
import { useCatalog } from '../context/CatalogContext'
import { InstagramIcon, WhatsAppIcon, Spark4 } from './ui'

export default function Footer() {
  const { categories } = useCatalog()
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="footer__logo">
            <MascotImage variant="hero" className="footer__mark" title="A Guantes Negros" />
            <span>
              A&nbsp;Guantes
              <br />
              Negros
            </span>
          </div>
          <p className="footer__claim">
            Insumos para tatuar. <br />
            Todo lo que necesitás, en un solo lugar.
          </p>
          <div className="footer__social">
            <a href="https://wa.me/5491100000000" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </a>
            <a href="https://instagram.com/aguantesnegros" target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramIcon />
              <span>@aguantesnegros</span>
            </a>
          </div>
        </div>

        <nav className="footer__col" aria-label="Tienda">
          <p className="footer__title">Tienda</p>
          {categories.slice(0, 6).map((c) => (
            <Link key={c.slug} to={`/categoria/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </nav>

        <nav className="footer__col" aria-label="Ayuda">
          <p className="footer__title">Ayuda</p>
          <Link to="/faq">Preguntas frecuentes</Link>
          <Link to="/faq">Envíos</Link>
          <Link to="/faq">Cambios y devoluciones</Link>
          <Link to="/faq">Garantías</Link>
          <a href="mailto:hola@aguantesnegros.com.ar">hola@aguantesnegros.com.ar</a>
        </nav>

        <div className="footer__col footer__cta">
          <p className="footer__title">¿Dudas antes de comprar?</p>
          <p className="footer__text">Escribinos y te asesora un tatuador, no un bot.</p>
          <a className="btn btn--light" href="https://wa.me/5491100000000" target="_blank" rel="noreferrer">
            <span className="btn__label">Hablar por WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="footer__strip">
        <div className="container footer__strip-inner">
          <p>
            © {new Date().getFullYear()} A Guantes Negros <Spark4 className="footer__spark" /> Hecho en Argentina, con tinta.
          </p>
          <div className="footer__legal">
            <Link to="/faq">Términos</Link>
            <Link to="/faq">Privacidad</Link>
            <Link to="/faq">Defensa al consumidor</Link>
            <Link to="/admin">Gestión</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
