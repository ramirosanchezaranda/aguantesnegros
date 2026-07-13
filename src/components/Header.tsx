import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useMascotMood } from '../context/MascotMoodContext'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { useTheme } from '../context/ThemeContext'
import { CartIcon, MenuIcon, MoonIcon, SunIcon } from './ui'

export default function Header() {
  const { pulse } = useMascotMood()
  const { count } = useCart()
  const { categories } = useCatalog()
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

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

  // B10: close drawer on Escape
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // B10: focus trap inside drawer
  useEffect(() => {
    if (!menuOpen) return
    const drawer = drawerRef.current
    if (!drawer) return
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    drawer.addEventListener('keydown', trap)
    return () => drawer.removeEventListener('keydown', trap)
  }, [menuOpen])

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
            <button
              ref={menuBtnRef}
              className="header__menu"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
              aria-expanded={menuOpen}
              aria-controls="site-drawer"
            >
              <MenuIcon open={menuOpen} />
              <span className="header__menu-label">Menú</span>
            </button>
            <nav className="header__nav" aria-label="Principal">
              <NavLink to="/categorias">Categorías</NavLink>
              <NavLink to="/categoria/descartables">Descartables</NavLink>
              <NavLink to="/categoria/pigmentos">Pigmentos</NavLink>
              <NavLink to="/faq">FAQ</NavLink>
            </nav>
          </div>

          <Link
            to="/"
            className="logo"
            onClick={() => {
              setMenuOpen(false)
              pulse('excited', 900)
            }}
            aria-label="A Guantes Negros — inicio"
          >
            <img src="/mascot/logomark.png" className="logo__mark" alt="A Guantes Negros" draggable={false} />
            <span className="logo__text">
              A&nbsp;Guantes
              <br />
              Negros
            </span>
          </Link>

          <div className="header__actions">
            <button
              className="header__icon header__theme"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
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

        <div
          id="site-drawer"
          ref={drawerRef}
          className={`drawer ${menuOpen ? 'drawer--open' : ''}`}
          aria-hidden={!menuOpen}
        >
          <nav className="drawer__nav container" aria-label="Categorías">
            <p className="drawer__eyebrow">Categorías</p>
            {categories.map((c, i) => (
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
