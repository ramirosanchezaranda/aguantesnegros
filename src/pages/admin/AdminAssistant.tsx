import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { getRepo } from '../../lib/catalog'
import { DEFAULT_STOCK, stockOf, type ArtKind, type Product } from '../../data/catalog'
import { formatPrice } from '../../lib/format'
import {
  findCandidates,
  parseLines,
  STRONG_SIMILARITY,
  uniqueSlug,
  type ParsedLine,
} from '../../lib/productCommand'

/** Ilustración por defecto de un producto nuevo, según su categoría. */
const ART_BY_CATEGORY: Record<string, ArtKind> = {
  pigmentos: 'ink',
  bioseguridad: 'gloves',
  agujas: 'cartridge',
  varios: 'stencil',
}

const EXAMPLES = [
  'guantes negros x100 valor proveedor $13000 venta $15500',
  'Dynamic Black 8oz costo 9000 precio 15000 stock 12',
  'cartuchos 3RL precio de venta $12.000 proveedor $7.500',
  'papel film stock 30',
]

interface Draft {
  id: string
  parsed: ParsedLine
  /** Slug del producto a editar, o '' para crear uno nuevo. */
  target: string
  name: string
  cost: string
  price: string
  stock: string
  category: string
  status: 'pending' | 'saving' | 'done' | 'error'
  message?: string
  /** Slug con el que quedó guardado, para poder enlazarlo. */
  savedSlug?: string
}

interface Turn {
  id: string
  input: string
  drafts: Draft[]
  /** Líneas escritas que no dejaron nada aprovechable. */
  ignored: string[]
}

const num = (v: number | undefined) => (v === undefined ? '' : String(v))

/** Mayúscula inicial, que es como se ven los demás productos. Va al campo
 *  editable, no al guardado directo: se ve antes de confirmar. */
function titleCase(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/**
 * Nombre que corresponde mostrar.
 *
 * Al actualizar se muestra el nombre que el producto YA tiene, no el pedazo
 * que se escribió para encontrarlo: "guantes negros venta 17000" sirve para
 * dar con "Guantes de Nitrilo Negros x100", pero confirmarlo no puede
 * renombrarlo a la mitad de su nombre. Para renombrar está el campo.
 */
function nameFor(target: string, parsedName: string, products: Product[]): string {
  const existing = target ? products.find((p) => p.slug === target) : undefined
  return existing ? existing.name : titleCase(parsedName)
}

export default function AdminAssistant() {
  const { products, categories, reload } = useCatalog()
  const [input, setInput] = useState('')
  const [turns, setTurns] = useState<Turn[]>([])
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const fallbackCategory = categories[0]?.slug ?? 'varios'
  const categorySlugs = useMemo(() => new Set(categories.map((c) => c.slug)), [categories])

  function submit() {
    const text = input.trim()
    if (!text) return
    const parsed = parseLines(text)
    // Una línea sólo da una tarjeta si trae algún número o si se parece a un
    // producto que ya existe. Sin eso no hay nada que hacer con ella —no se
    // puede crear sin precio ni editar sin un cambio— y llenar la pantalla de
    // tarjetas vacías al pegar una lista con encabezados sería peor que
    // decir derecho que no se entendió.
    const usable = parsed.filter(
      (p) =>
        p.cost !== undefined ||
        p.price !== undefined ||
        p.stock !== undefined ||
        findCandidates(p.name, products).length > 0,
    )
    const written = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    const ignored = written.filter((l) => !usable.some((p) => p.raw === l))

    const drafts: Draft[] = usable.map((p, i) => {
      const candidates = findCandidates(p.name, products)
      const best = candidates[0]
      // Sólo se preselecciona el producto existente cuando el parecido es
      // alto. Con dudas arranca en "crear nuevo": inventar un producto de más
      // se arregla borrándolo, pisar el equivocado se arregla mucho peor.
      const target = best && best.score >= STRONG_SIMILARITY ? best.product.slug : ''
      const existing = target ? products.find((x) => x.slug === target) : undefined
      const category =
        p.category && categorySlugs.has(p.category)
          ? p.category
          : existing?.category ?? fallbackCategory
      return {
        id: `${Date.now()}-${i}`,
        parsed: p,
        target,
        name: nameFor(target, p.name, products),
        cost: num(p.cost),
        price: num(p.price),
        stock: num(p.stock),
        category,
        status: 'pending',
      }
    })

    setTurns((t) => [...t, { id: String(Date.now()), input: text, drafts, ignored }])
    setInput('')
    inputRef.current?.focus()
  }

  function patch(turnId: string, draftId: string, next: Partial<Draft>) {
    setTurns((ts) =>
      ts.map((t) =>
        t.id !== turnId
          ? t
          : { ...t, drafts: t.drafts.map((d) => (d.id === draftId ? { ...d, ...next } : d)) },
      ),
    )
  }

  async function save(turn: Turn, draft: Draft) {
    const name = draft.name.trim()
    if (!name) return patch(turn.id, draft.id, { status: 'error', message: 'Falta el nombre.' })

    const toNum = (v: string) => (v.trim() === '' ? undefined : Math.max(0, Number(v)))
    const cost = toNum(draft.cost)
    const price = toNum(draft.price)
    const stock = toNum(draft.stock)
    if ([cost, price, stock].some((v) => v !== undefined && !Number.isFinite(v))) {
      return patch(turn.id, draft.id, { status: 'error', message: 'Hay un número que no se entiende.' })
    }

    const existing = draft.target ? products.find((p) => p.slug === draft.target) : undefined
    if (draft.target && !existing) {
      return patch(turn.id, draft.id, { status: 'error', message: 'Ese producto ya no está.' })
    }
    if (!existing && price === undefined) {
      return patch(turn.id, draft.id, {
        status: 'error',
        message: 'Un producto nuevo necesita precio de venta.',
      })
    }

    // Editar es fusionar: sólo se pisa lo que vino escrito. Todo lo demás
    // —fotos, descripción, especificaciones, colores— queda como estaba.
    const product: Product = existing
      ? {
          ...existing,
          name,
          category: draft.category,
          ...(price !== undefined && { price }),
          ...(cost !== undefined && { cost }),
          ...(stock !== undefined && { stock }),
        }
      : {
          slug: uniqueSlug(name, products),
          name,
          brand: 'A Guantes Negros',
          price: price ?? 0,
          category: draft.category,
          art: ART_BY_CATEGORY[draft.category] ?? 'kit',
          rating: 5,
          reviews: 0,
          description: '',
          specs: [],
          stock: stock ?? DEFAULT_STOCK,
          ...(cost !== undefined && { cost }),
        }

    patch(turn.id, draft.id, { status: 'saving', message: undefined })
    try {
      await getRepo().saveProduct(product)
      await reload()
      patch(turn.id, draft.id, {
        status: 'done',
        savedSlug: product.slug,
        message: existing ? `Actualicé "${product.name}".` : `Creé "${product.name}".`,
      })
    } catch (e) {
      patch(turn.id, draft.id, {
        status: 'error',
        message: e instanceof Error ? e.message : 'No se pudo guardar.',
      })
    }
  }

  function discard(turnId: string, draftId: string) {
    setTurns((ts) =>
      ts.map((t) => (t.id !== turnId ? t : { ...t, drafts: t.drafts.filter((d) => d.id !== draftId) })),
    )
  }

  /** Qué cambia respecto de lo que ya está guardado. */
  function changes(draft: Draft): [string, string, string][] {
    const existing = draft.target ? products.find((p) => p.slug === draft.target) : undefined
    if (!existing) return []
    const rows: [string, string, string][] = []
    const money = (v: number | undefined) => (v === undefined ? '—' : formatPrice(v))
    if (draft.name.trim() && draft.name.trim() !== existing.name) {
      rows.push(['Nombre', existing.name, draft.name.trim()])
    }
    if (draft.price.trim() !== '' && Number(draft.price) !== existing.price) {
      rows.push(['Precio de venta', money(existing.price), money(Number(draft.price))])
    }
    if (draft.cost.trim() !== '' && Number(draft.cost) !== existing.cost) {
      rows.push(['Costo de proveedor', money(existing.cost), money(Number(draft.cost))])
    }
    if (draft.stock.trim() !== '' && Number(draft.stock) !== stockOf(existing)) {
      rows.push(['Stock', `${stockOf(existing)} u`, `${Number(draft.stock)} u`])
    }
    if (draft.category !== existing.category) {
      const nameOf = (s: string) => categories.find((c) => c.slug === s)?.name ?? s
      rows.push(['Categoría', nameOf(existing.category), nameOf(draft.category)])
    }
    return rows
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Productos por IA</h1>
          <p className="admin-page__meta">Escribí el producto como lo dirías y lo cargo o lo actualizo</p>
        </div>
      </header>

      <div className="chat">
        <div className="chat__log" role="log" aria-live="polite">
          {turns.length === 0 && (
            <div className="chat__empty">
              <p className="chat__empty-title">Escribí un producto y lo cargo.</p>
              <p className="chat__empty-text">
                Entiendo el nombre, el <strong>costo de proveedor</strong>, el <strong>precio de venta</strong> y el{' '}
                <strong>stock</strong>, escritos como los dirías. Si ya existe algo parecido, te lo muestro para
                actualizarlo en vez de duplicarlo. Podés pegar <strong>varias líneas de una</strong>: una por producto.
              </p>
              <p className="chat__empty-label">Probá con:</p>
              <div className="chat__examples">
                {EXAMPLES.map((e) => (
                  <button key={e} type="button" className="chat__example" onClick={() => setInput(e)}>
                    {e}
                  </button>
                ))}
              </div>
              <p className="chat__empty-foot">
                Nada se guarda hasta que lo confirmes: primero te muestro qué entendí y qué va a cambiar.
              </p>
            </div>
          )}

          {turns.map((turn) => (
            <div className="chat__turn" key={turn.id}>
              <p className="chat__said">{turn.input}</p>

              {turn.ignored.length > 0 && (
                <p className="chat__note chat__note--warn">
                  No pude sacar nada de {turn.ignored.length === 1 ? 'esta línea' : 'estas líneas'}:{' '}
                  {turn.ignored.map((l) => `"${l}"`).join(', ')}. Probá poniendo el nombre y después
                  “proveedor” y “venta” con los números.
                </p>
              )}

              {turn.drafts.length === 0 && turn.ignored.length === 0 && (
                <p className="chat__note">No encontré ningún producto en eso.</p>
              )}

              {turn.drafts.map((draft) => {
                const candidates = findCandidates(draft.parsed.name, products)
                const rows = changes(draft)
                const existing = draft.target ? products.find((p) => p.slug === draft.target) : undefined
                const done = draft.status === 'done'
                return (
                  <article className={`draft ${done ? 'draft--done' : ''}`} key={draft.id}>
                    <header className="draft__head">
                      <span className={`draft__tag ${existing ? 'draft__tag--edit' : 'draft__tag--new'}`}>
                        {done ? '✓ Guardado' : existing ? 'Actualizar' : 'Producto nuevo'}
                      </span>
                      <strong className="draft__name">{draft.name || 'Sin nombre'}</strong>
                    </header>

                    {done ? (
                      <p className="draft__done">
                        {draft.message}{' '}
                        {draft.savedSlug && <Link to={`/admin/productos/${draft.savedSlug}`}>Abrir la ficha</Link>}
                      </p>
                    ) : (
                      <>
                        {draft.parsed.warnings.map((w) => (
                          <p className="chat__note chat__note--warn" key={w}>
                            {w}
                          </p>
                        ))}

                        <label className="draft__field">
                          <span>¿Qué hago con esto?</span>
                          <select
                            value={draft.target}
                            onChange={(e) =>
                              patch(turn.id, draft.id, {
                                target: e.target.value,
                                name: nameFor(e.target.value, draft.parsed.name, products),
                              })
                            }
                          >
                            <option value="">Crear un producto nuevo</option>
                            {candidates.map((c) => (
                              <option key={c.product.slug} value={c.product.slug}>
                                Actualizar “{c.product.name}” ({Math.round(c.score * 100)}% parecido)
                              </option>
                            ))}
                          </select>
                          {candidates.length > 0 && !draft.target && (
                            <small className="draft__hint">
                              Hay {candidates.length === 1 ? 'un producto parecido' : 'productos parecidos'}: fijate
                              que no estés duplicando.
                            </small>
                          )}
                        </label>

                        <div className="draft__grid">
                          <label className="draft__field">
                            <span>Nombre</span>
                            <input
                              value={draft.name}
                              onChange={(e) => patch(turn.id, draft.id, { name: e.target.value })}
                            />
                          </label>
                          <label className="draft__field">
                            <span>Categoría</span>
                            <select
                              value={draft.category}
                              onChange={(e) => patch(turn.id, draft.id, { category: e.target.value })}
                            >
                              {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                            {draft.parsed.categoryGuessed && (
                              <small className="draft__hint">La deduje del nombre; cambiala si no va.</small>
                            )}
                          </label>
                          <label className="draft__field">
                            <span>Costo de proveedor</span>
                            <input
                              type="number"
                              min={0}
                              value={draft.cost}
                              placeholder={existing?.cost !== undefined ? String(existing.cost) : 'sin cargar'}
                              onChange={(e) => patch(turn.id, draft.id, { cost: e.target.value })}
                            />
                          </label>
                          <label className="draft__field">
                            <span>Precio de venta</span>
                            <input
                              type="number"
                              min={0}
                              value={draft.price}
                              placeholder={existing ? String(existing.price) : 'obligatorio'}
                              onChange={(e) => patch(turn.id, draft.id, { price: e.target.value })}
                            />
                          </label>
                          <label className="draft__field">
                            <span>Stock</span>
                            <input
                              type="number"
                              min={0}
                              value={draft.stock}
                              placeholder={existing ? String(stockOf(existing)) : String(DEFAULT_STOCK)}
                              onChange={(e) => patch(turn.id, draft.id, { stock: e.target.value })}
                            />
                          </label>
                        </div>

                        {existing && (
                          <div className="draft__diff">
                            <p className="draft__diff-title">Qué va a cambiar</p>
                            {rows.length === 0 ? (
                              <p className="draft__diff-empty">Nada: los valores son los que ya tiene.</p>
                            ) : (
                              <ul>
                                {rows.map(([label, from, to]) => (
                                  <li key={label}>
                                    <span>{label}</span>
                                    <span className="draft__from">{from}</span>
                                    <span aria-hidden="true">→</span>
                                    <strong>{to}</strong>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <p className="draft__diff-foot">
                              Las fotos, la descripción y el resto de la ficha quedan como están.
                            </p>
                          </div>
                        )}

                        {draft.status === 'error' && (
                          <p className="chat__note chat__note--error">{draft.message}</p>
                        )}

                        <div className="draft__actions">
                          <button
                            className="admin-btn admin-btn--primary"
                            onClick={() => save(turn, draft)}
                            disabled={draft.status === 'saving' || (!!existing && rows.length === 0)}
                          >
                            {draft.status === 'saving'
                              ? 'Guardando…'
                              : existing
                                ? 'Confirmar cambios'
                                : 'Crear producto'}
                          </button>
                          <button
                            className="admin-btn admin-btn--ghost"
                            onClick={() => discard(turn.id, draft.id)}
                            disabled={draft.status === 'saving'}
                          >
                            Descartar
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                )
              })}
            </div>
          ))}
        </div>

        <div className="chat__composer">
          <textarea
            ref={inputRef}
            className="chat__input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter envía; Shift+Enter hace salto de línea, que es lo que
              // hace falta para pegar una lista de varios productos.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="guantes negros x100 valor proveedor $13000 venta $15500"
            aria-label="Escribí el producto"
          />
          <button className="admin-btn admin-btn--primary chat__send" onClick={submit} disabled={!input.trim()}>
            Enviar
          </button>
        </div>
        <p className="chat__legend">
          Enter envía · Shift + Enter agrega una línea para cargar varios productos de una
        </p>
      </div>
    </div>
  )
}
