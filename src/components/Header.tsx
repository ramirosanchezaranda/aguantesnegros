import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import LogoMark from './mascot/LogoMark'
import { useMascotMood } from '../context/MascotMoodContext'
import { useCart } from '../context/CartContext'
import { CartIcon, MenuIcon, SearchIcon, UserIcon } from './ui'
import { CATEGORIES } from '../data/catalog'

export default function Header() {
  const { mood, pulse } = useMascotMood()
  const { count } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) document.body.classList.add('no-scroll')
    else document.body.classList.remove('no-scroll')
    return () => document.body.classList.remove('no-scroll')
  }, [menuOpen])

  // Al pasar el mouse por el logo, Guantín espía por encima de los lentes.
  const logoMood = hovering && mood === 'happy' ? 'peek' : mood

  return (
    <>
      <div className="topbar">
        <p>
          ENVÍOS A TODO EL PAÍS <span className="topbar__dot">•</span> 3 CUOTAS SIN INTERÉS
        </p>
      </div>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header__inner container">
          <div className="header__left">
            <button className="header__menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú" aria-expanded={menuOpen}>
              <MenuIcon open={menuOpen} />
              <span className="header__menu-label">Menú</span>
            </button>
            <nav className="header__nav" aria-label="Principal">
              <NavLink to="/categorias">Categorías</NavLink>
              <NavLink to="/categoria/maquinas">Máquinas</NavLink>
              <NavLink to="/categoria/tintas">Tintas</NavLink>
              <NavLink to="/faq">FAQ</NavLink>
            </nav>
          </div>

          <Link
            to="/"
            className="logo"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() => {
              setMenuOpen(false)
              pulse('excited', 900)
            }}
            aria-label="A Guantes Negros — inicio"
          >
            <LogoMark mood={logoMood} className="logo__mark" />
            <span className="logo__text">
              A&nbsp;Guantes
              <br />
              Negros
            </span>
          </Link>

          <div className="header__actions">
            <button className="header__icon" aria-label="Buscar">
              <SearchIcon />
            </button>
            <button className="header__icon header__icon--desktop" aria-label="Mi cuenta">
              <UserIcon />
            </button>
            <Link to="/carrito" className="header__icon header__cart" aria-label={`Carrito, ${count} productos`}>
              <CartIcon />
              {count > 0 && (
                <span className="header__badge" key={count}>
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className={`drawer ${menuOpen ? 'drawer--open' : ''}`}>
          <nav className="drawer__nav container" aria-label="Categorías">
            <p className="drawer__eyebrow">Categorías</p>
            {CATEGORIES.map((c, i) => (
              <Link key={c.slug} to={`/categoria/${c.slug}`} onClick={() => setMenuOpen(false)} style={{ transitionDelay: `${60 + i * 30}ms` }}>
                {c.name}
                <span className="drawer__tag">{c.tagline}</span>
              </Link>
            ))}
            <div className="drawer__foot">
              <Link to="/faq" onClick={() => setMenuOpen(false)}>
                Preguntas frecuentes
              </Link>
              <Link to="/carrito" onClick={() => setMenuOpen(false)}>
                Tu carrito
              </Link>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
