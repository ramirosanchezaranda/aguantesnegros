import { Link } from 'react-router-dom'
import { MascotImage } from '../components/mascot/Mascot'
import { CATEGORIES, productsByCategory } from '../data/catalog'
import { Reveal } from '../components/ui'

export default function Categories() {
  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <span aria-current="page">Categorías</span>
        </nav>
        <header className="page__head">
          <div>
            <h1 className="page__title">Categorías</h1>
            <p className="page__sub">Encontrá todo lo que necesitás para tatuar con calidad y seguridad.</p>
          </div>
          <MascotImage variant="rock" className="page__mascot" title="Guantín festejando" />
        </header>

        <div className="catgrid catgrid--page">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 40}>
              <Link to={`/categoria/${c.slug}`} className="catcard catcard--big">
                <MascotImage variant={c.mascot} className="catcard__mascot" title={`Guantín — ${c.name}`} />
                <h2>{c.name}</h2>
                <p>
                  {productsByCategory(c.slug).length}{' '}
                  {productsByCategory(c.slug).length === 1 ? 'producto' : 'productos'}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
