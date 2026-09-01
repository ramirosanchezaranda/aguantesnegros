import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { stockOf } from '../data/catalog'
import { formatPrice } from '../lib/format'
import { whatsappLink } from '../data/shop'
import ProductArt from '../components/ProductArt'
import BrandMascot from '../components/mascot/BrandMascot'
import { Button } from '../components/ui'

// Compra guiada para quien no sabe qué llevar. En vez de una lista fija, el kit
// se arma con lo que hay en stock en cada categoría esencial: si la tienda
// cambia el catálogo, esto sigue funcionando sin tocar código.

type Level = 'primera' | 'reponer'
type Style = 'linea' | 'color' | 'ambos'

interface Slot {
  category: string
  title: string
  why: string
  /** Cuántas unidades sugerimos de este rubro. */
  qty: number
  /** Filtro fino dentro de la categoría. Sin esto, "agujas" devolvería
   *  cualquier configuración y podríamos sugerir una round liner para
   *  relleno, que es exactamente lo contrario de lo que se necesita. */
  prefer?: (name: string) => boolean
}

/** Round liner: la aguja de línea. */
const isLiner = (name: string) => /\bRL\b|\d+\s*RL/i.test(name)
/** Magnum, round shader y curved magnum: las de sombra y relleno. */
const isFiller = (name: string) => /\bM1\b|\bRM\b|\bRS\b|\d+\s*(M1|RM|RS)/i.test(name)

/** Qué necesita sí o sí alguien que arranca, en orden de importancia. */
function slotsFor(level: Level, style: Style): Slot[] {
  const base: Slot[] = [
    {
      category: 'bioseguridad',
      title: 'Bioseguridad',
      why: 'Guantes y barreras: es lo que no se negocia en ninguna sesión.',
      qty: 1,
    },
    {
      category: 'agujas',
      title: style === 'color' ? 'Agujas para relleno' : 'Agujas para línea',
      why: style === 'color' ? 'Magnum o round shader para empaquetar color.' : 'Round liner, la configuración más usada.',
      qty: level === 'primera' ? 1 : 2,
      prefer: style === 'color' ? isFiller : isLiner,
    },
    {
      category: 'pigmentos',
      title: 'Tinta',
      why: 'Un negro rinde para línea, sombra y relleno.',
      qty: 1,
    },
    {
      category: 'varios',
      title: 'Stencil y cuidado',
      why: 'Para transferir el diseño y cerrar bien la sesión.',
      qty: 1,
    },
  ]
  if (style === 'ambos') {
    base.splice(2, 0, {
      category: 'agujas',
      title: 'Agujas para relleno',
      why: 'Si hacés línea y color, conviene tener las dos configuraciones.',
      qty: 1,
      prefer: isFiller,
    })
  }
  return base
}

export default function CompraRapida() {
  const { products } = useCatalog()
  const { add } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [level, setLevel] = useState<Level>('primera')
  const [style, setStyle] = useState<Style>('linea')
  const [skipped, setSkipped] = useState<string[]>([])

  // Un producto por rubro: el destacado con stock, y si no hay, el más barato
  // con stock. Nunca recomendamos algo que no podemos entregar.
  const kit = useMemo(() => {
    const used = new Set<string>()
    return slotsFor(level, style)
      .map((slot) => {
        const inCategory = products.filter(
          (p) => p.category === slot.category && stockOf(p) > 0 && !used.has(p.slug),
        )
        // Si el filtro fino no encuentra nada, se cae a la categoría entera
        // antes que dejar el rubro vacío.
        const matching = slot.prefer ? inCategory.filter((p) => slot.prefer!(p.name)) : inCategory
        const candidates = (matching.length ? matching : inCategory).sort(
          (a, b) => Number(!!b.featured) - Number(!!a.featured) || a.price - b.price,
        )
        const product = candidates[0]
        if (product) used.add(product.slug)
        return product ? { slot, product } : null
      })
      .filter((x): x is { slot: Slot; product: (typeof products)[number] } => x !== null)
  }, [products, level, style])

  const chosen = kit.filter(({ product }) => !skipped.includes(product.slug))
  const total = chosen.reduce((s, { product, slot }) => s + product.price * slot.qty, 0)

  function addAll() {
    for (const { product, slot } of chosen) add(product.slug, slot.qty)
    navigate('/carrito')
  }

  return (
    <main className="page">
      <div className="container">
        <nav className="crumbs" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> <span>/</span> <span aria-current="page">Compra rápida</span>
        </nav>

        <header className="quick__head">
          <BrandMascot variant="pointing" className="quick__mascot" title="Guantín te ayuda a elegir" />
          <div>
            <h1 className="page__title">Compra rápida</h1>
            <p className="page__sub">
              ¿No sabés por dónde empezar? Respondé dos cosas y te armamos el equipo con lo que realmente vas a usar.
            </p>
          </div>
        </header>

        {step === 0 && (
          <section className="quick__step">
            <h2 className="quick__q">¿En qué momento estás?</h2>
            <div className="choices">
              {(
                [
                  ['primera', 'Es mi primera vez', 'Arranco de cero y necesito lo esencial.'],
                  ['reponer', 'Ya tatúo, vengo a reponer', 'Sé lo que uso, quiero lo básico rápido.'],
                ] as [Level, string, string][]
              ).map(([id, label, detail]) => (
                <label key={id} className={`choice ${level === id ? 'choice--on' : ''}`}>
                  <input type="radio" name="nivel" checked={level === id} onChange={() => setLevel(id)} />
                  <span className="choice__body">
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </label>
              ))}
            </div>
            <Button onClick={() => setStep(1)} arrow>
              Siguiente
            </Button>
          </section>
        )}

        {step === 1 && (
          <section className="quick__step">
            <h2 className="quick__q">¿Qué hacés más?</h2>
            <div className="choices">
              {(
                [
                  ['linea', 'Línea y lettering', 'Trazo fino y definido.'],
                  ['color', 'Color y relleno', 'Sombras y superficies grandes.'],
                  ['ambos', 'Un poco de todo', 'Prefiero estar cubierto en las dos.'],
                ] as [Style, string, string][]
              ).map(([id, label, detail]) => (
                <label key={id} className={`choice ${style === id ? 'choice--on' : ''}`}>
                  <input type="radio" name="estilo" checked={style === id} onChange={() => setStyle(id)} />
                  <span className="choice__body">
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </label>
              ))}
            </div>
            <div className="quick__nav">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Volver
              </Button>
              <Button onClick={() => setStep(2)} arrow>
                Ver mi equipo
              </Button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="quick__step">
            <h2 className="quick__q">Tu equipo recomendado</h2>
            {chosen.length === 0 ? (
              <p className="admin-alert">
                Ahora mismo no tenemos stock para armar el kit completo.{' '}
                <a href={whatsappLink('¡Hola! Quiero armar mi primer equipo para tatuar.')} target="_blank" rel="noreferrer">
                  Escribinos por WhatsApp
                </a>{' '}
                y lo vemos juntos.
              </p>
            ) : (
              <>
                <ul className="quick__kit">
                  {kit.map(({ slot, product }) => {
                    const off = skipped.includes(product.slug)
                    return (
                      <li key={product.slug} className={`quick__item ${off ? 'quick__item--off' : ''}`}>
                        <span className="quick__art">
                          <ProductArt product={product} />
                        </span>
                        <div className="quick__info">
                          <span className="quick__slot">{slot.title}</span>
                          <Link to={`/producto/${product.slug}`} className="quick__name">
                            {product.name}
                          </Link>
                          <small>{slot.why}</small>
                        </div>
                        <div className="quick__side">
                          <span className="quick__price">
                            {slot.qty > 1 && `${slot.qty} × `}
                            {formatPrice(product.price * slot.qty)}
                          </span>
                          <button
                            type="button"
                            className="quick__toggle"
                            onClick={() =>
                              setSkipped((s) => (off ? s.filter((x) => x !== product.slug) : [...s, product.slug]))
                            }
                          >
                            {off ? 'Agregar' : 'Quitar'}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="quick__foot">
                  <p className="quick__total">
                    Total <strong>{formatPrice(total)}</strong>
                    <small>{chosen.length} productos</small>
                  </p>
                  <div className="quick__nav">
                    <Button variant="ghost" onClick={() => setStep(1)}>
                      Cambiar respuestas
                    </Button>
                    <Button variant="red" onClick={addAll} disabled={chosen.length === 0}>
                      Agregar todo al carrito
                    </Button>
                  </div>
                </div>
                <p className="quick__help">
                  ¿Dudás de algo?{' '}
                  <a href={whatsappLink('¡Hola! Vi la compra rápida y quería consultar algo antes de comprar.')} target="_blank" rel="noreferrer">
                    Preguntanos por WhatsApp
                  </a>{' '}
                  — te responde un tatuador, no un bot.
                </p>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
