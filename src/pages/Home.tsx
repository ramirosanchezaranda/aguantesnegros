import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import BrandMascot from '../components/mascot/BrandMascot'
import ProductCard from '../components/ProductCard'
import { BRANDS, FAQS } from '../data/catalog'
import { Accordion, BadgeIcon, Button, CardIcon, Marquee, Reveal, Spark4, TruckIcon } from '../components/ui'
import { useMascotMood } from '../context/MascotMoodContext'
import { useCatalog } from '../context/CatalogContext'

export default function Home() {
  const { products, categories } = useCatalog()
  const featured = products.filter((p) => p.featured)
  const { pulse } = useMascotMood()
  const heroRef = useRef<HTMLDivElement>(null)

  // B8: parallax + scroll-shrink, throttled via requestAnimationFrame
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        hero.style.setProperty('--px', `${x * 14}px`)
        hero.style.setProperty('--py', `${y * 10}px`)
      })
    }
    let rafScroll = 0
    const onScroll = () => {
      cancelAnimationFrame(rafScroll)
      rafScroll = requestAnimationFrame(() => {
        const shrink = Math.max(0.9, 1 - window.scrollY / 2600)
        hero.style.setProperty('--shrink', String(shrink))
      })
    }
    hero.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      hero.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      cancelAnimationFrame(rafScroll)
    }
  }, [])

  return (
    <main>
      {/* HERO — logo-first, coreografía de entrada ------------------ */}
      <section className="hero hero--brand" ref={heroRef}>
        <div className="container hero__stage">
          <p className="hero__eyebrow intro intro--eyebrow">
            <Spark4 /> Insumos originales para tatuadores <Spark4 />
          </p>
          <div className="hero__mascot-wrap intro intro--mascot">
            <BrandMascot variant="hero" className="hero__mascot" title="Guantín, el logo de A Guantes Negros" />
          </div>
          <h1 className="hero__wordmark" aria-label="A Guantes Negros">
            <span className="hero__wordline intro intro--w1">
              <span>A&nbsp;Guantes</span>
            </span>
            <span className="hero__wordline intro intro--w2">
              <span>
                Negros<span className="hero__reg">®</span>
              </span>
            </span>
          </h1>
          <p className="hero__sub intro intro--sub">Insumos para tatuar. Todo lo que necesitás, en un solo lugar.</p>
          <div className="hero__ctas intro intro--ctas">
            <Button to="/compra-rapida" arrow onMouseEnter={() => pulse('excited', 700)}>
              No sé qué comprar
            </Button>
            <Button to="/categorias" variant="ghost">
              Ver productos
            </Button>
          </div>
        </div>
        <div className="intro intro--marquee">
          <Marquee
            className="hero__marquee"
            items={['ENVÍOS A TODO EL PAÍS', '3 CUOTAS SIN INTERÉS', 'PRODUCTOS ORIGINALES', 'ATENCIÓN DE TATUADOR A TATUADOR']}
          />
        </div>
      </section>

      {/* BENEFICIOS ------------------------------------------------ */}
      <section className="benefits">
        <div className="container benefits__grid">
          <Reveal className="benefit">
            <TruckIcon />
            <div>
              <h3>Envíos a todo el país</h3>
              <p>Rápidos y seguros</p>
            </div>
          </Reveal>
          <Reveal className="benefit" delay={80}>
            <CardIcon />
            <div>
              <h3>3 cuotas sin interés</h3>
              <p>Con tarjetas seleccionadas</p>
            </div>
          </Reveal>
          <Reveal className="benefit" delay={160}>
            <BadgeIcon />
            <div>
              <h3>Productos originales</h3>
              <p>Calidad garantizada</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATEGORÍAS ------------------------------------------------ */}
      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <h2 className="section__title">Categorías</h2>
            <Link className="section__link" to="/categorias">
              Ver todo <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <div className="catgrid">
            {categories.slice(0, 8).map((c, i) => (
              <Reveal key={c.slug} delay={i * 50}>
                <Link to={`/categoria/${c.slug}`} className="catcard">
                  <BrandMascot variant={c.mascot} className="catcard__mascot" title={`Guantín — ${c.name}`} />
                  <h3>{c.name}</h3>
                  <p>{c.tagline}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DESTACADOS ------------------------------------------------ */}
      <section className="section section--tint">
        <div className="container">
          <Reveal className="section__head">
            <h2 className="section__title">Productos destacados</h2>
            <Link className="section__link" to="/categorias">
              Ver todo <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <div className="prodgrid">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BANNER ---------------------------------------------------- */}
      <section className="banner">
        <div className="container banner__grid">
          <Reveal className="banner__copy">
            <p className="banner__eyebrow">Palabra de la casa</p>
            <h2 className="banner__title">
              No tatúes
              <br />
              con cualquier
              <br />
              cosa<span className="hero__dot">.</span>
            </h2>
            <p className="banner__sub">
              Las agujas no se eligen al azar. Comprá como un profesional: marcas originales, stock real y asesoramiento de gente que tatúa.
            </p>
            <Button to="/categoria/agujas" variant="light" arrow>
              Ver agujas
            </Button>
          </Reveal>
          <div className="banner__figure">
            <img src="/mascot/logo-happy.png" className="banner__mascot" alt="Guantín" draggable={false} />
          </div>
        </div>
      </section>

      {/* MARCAS ---------------------------------------------------- */}
      <section className="section">
        <div className="container">
          <Reveal className="section__head">
            <h2 className="section__title">Marcas que laburamos</h2>
          </Reveal>
          <div className="brands">
            {BRANDS.map((b, i) => (
              <Reveal key={b} delay={i * 40} className="brands__cell">
                <span className={`brands__logo brands__logo--${i % 4}`}>{b}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ------------------------------------------------------- */}
      <section className="section section--tint">
        <div className="container faqhome">
          <Reveal className="faqhome__side">
            <h2 className="section__title">
              Preguntas
              <br />
              frecuentes
            </h2>
            <p className="faqhome__sub">Respondemos las dudas más comunes para que compres con confianza.</p>
            <BrandMascot variant="question" className="faqhome__mascot" title="Guantín con una duda" />
            <Link className="section__link" to="/faq">
              Ver todas <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <div className="faqhome__list">
            {FAQS.slice(0, 4).map(([q, a], i) => (
              <Reveal key={q} delay={i * 60}>
                <Accordion title={q} defaultOpen={i === 0}>
                  <p>{a}</p>
                </Accordion>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
