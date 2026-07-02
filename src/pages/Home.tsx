import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Mascot from '../components/mascot/Mascot'
import ProductCard from '../components/ProductCard'
import { BRANDS, CATEGORIES, FAQS, PRODUCTS } from '../data/catalog'
import { Accordion, BadgeIcon, Button, CardIcon, Marquee, Reveal, Spark4, TruckIcon } from '../components/ui'
import { useMascotMood } from '../context/MascotMoodContext'

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured)
  const { pulse } = useMascotMood()
  const heroRef = useRef<HTMLDivElement>(null)

  // Parallax leve del personaje siguiendo el mouse.
  useEffect(() => {
    const hero = heroRef.current
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      hero.style.setProperty('--px', `${x * 14}px`)
      hero.style.setProperty('--py', `${y * 10}px`)
    }
    hero.addEventListener('mousemove', onMove)
    return () => hero.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <main>
      {/* HERO ------------------------------------------------------ */}
      <section className="hero" ref={heroRef}>
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="hero__eyebrow">
              <Spark4 /> Insumos originales para tatuadores
            </p>
            <h1 className="hero__title">
              Insumos
              <br />
              para
              <br />
              <em>
                tatuar<span className="hero__dot">.</span>
              </em>
            </h1>
            <p className="hero__sub">Todo lo que necesitás, en un solo lugar.</p>
            <div className="hero__ctas">
              <Button to="/categorias" arrow>
                Ver productos
              </Button>
              <Button
                to="/producto/maquina-inalambrica-clash-pro"
                variant="ghost"
                onMouseEnter={() => pulse('excited', 700)}
              >
                Comprar ahora
              </Button>
            </div>
          </div>
          <div className="hero__figure">
            <div className="hero__mascot-wrap">
              <Mascot variant="hero" rays className="hero__mascot" title="Guantín saludando con la V" />
            </div>
            <span className="hero__scribble" aria-hidden="true" />
          </div>
        </div>
        <Marquee
          className="hero__marquee"
          items={['ENVÍOS A TODO EL PAÍS', '3 CUOTAS SIN INTERÉS', 'PRODUCTOS ORIGINALES', 'ATENCIÓN DE TATUADOR A TATUADOR']}
        />
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
            {CATEGORIES.slice(0, 8).map((c, i) => (
              <Reveal key={c.slug} delay={i * 50}>
                <Link to={`/categoria/${c.slug}`} className="catcard">
                  <Mascot variant={c.mascot} className="catcard__mascot" title={`Guantín — ${c.name}`} />
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
            <Mascot variant="rock" className="banner__mascot" title="Guantín haciendo cuernitos" />
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
            <Mascot variant="question" className="faqhome__mascot" title="Guantín con una duda" />
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
