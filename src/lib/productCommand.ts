// Alta y edición de productos escribiendo en lenguaje suelto.
//
// "guantes negros x100 valor proveedor $13000 venta $15500"
//
// No hay ningún modelo de lenguaje acá: es un léxico de sinónimos y unas
// reglas. Eso lo hace predecible —la misma frase da siempre lo mismo—, gratis
// y capaz de funcionar sin conexión. A cambio, sólo entiende lo que está en el
// léxico, así que lo que reconoce se muestra siempre para que se pueda
// corregir antes de guardar: el parser propone, la persona confirma.

import type { Product } from '../data/catalog'

/** Un número tal como se escribe en Argentina: $13.000, 13000, 15.500,50 */
const NUMBER = String.raw`\d{1,3}(?:[.\s]\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?`

/** Sinónimos por campo, del más específico al más general: "precio venta"
 *  tiene que ganarle a "precio" y a "venta" por separado. */
const LEXICON: { field: 'cost' | 'price' | 'stock'; words: string[] }[] = [
  {
    field: 'cost',
    words: [
      'valor de proveedor',
      'valor proveedor',
      'precio de proveedor',
      'precio proveedor',
      'precio de costo',
      'precio costo',
      'costo unitario',
      'proveedor',
      'costo',
      'coste',
      'compra',
      'me sale',
      'me cuesta',
    ],
  },
  {
    field: 'price',
    words: [
      'precio de venta',
      'precio venta',
      'precio al publico',
      'precio publico',
      'valor de venta',
      'valor venta',
      'lo vendo a',
      'venta',
      'vendo',
      'precio',
      'pvp',
      'publico',
    ],
  },
  {
    field: 'stock',
    words: ['stock', 'cantidad', 'unidades', 'quedan', 'tengo', 'hay'],
  },
]

/** Categorías que se pueden nombrar directamente ("categoria agujas"). */
const CATEGORY_WORDS = ['categoria', 'categoría', 'cat', 'rubro']

/** Pistas para adivinar la categoría cuando no se la nombra. Es una ayuda,
 *  no una decisión: siempre se muestra y se puede cambiar antes de guardar. */
const CATEGORY_HINTS: [RegExp, string][] = [
  [/\b(aguja|agujas|cartucho|cartuchos|rl|rs|rm|mg|m1)\b/, 'agujas'],
  [/\b(tinta|tintas|pigmento|pigmentos|black|color)\b/, 'pigmentos'],
  [/\b(guante|guantes|barbijo|barbijos|film|papel|alcohol|jabon|gasa|descartable|descartables)\b/, 'bioseguridad'],
]

export interface ParsedLine {
  /** La línea tal cual se escribió. */
  raw: string
  /** Lo que queda después de sacar los campos reconocidos. */
  name: string
  cost?: number
  price?: number
  stock?: number
  /** Slug de categoría, si se nombró o se pudo inferir. */
  category?: string
  /** Si la categoría salió de una pista y no de un nombre explícito. */
  categoryGuessed: boolean
  /** Cosas que conviene mirar antes de guardar. */
  warnings: string[]
}

/** Minúsculas y sin acentos, conservando a qué posición del original
 *  corresponde cada carácter, para poder recortar el nombre después. */
function fold(input: string): { text: string; map: number[] } {
  let text = ''
  const map: number[] = []
  for (let i = 0; i < input.length; i++) {
    const folded = input[i]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
    for (const ch of folded) {
      text += ch
      map.push(i)
    }
  }
  return { text, map }
}

/**
 * Lee un número escrito a la argentina.
 *
 * El punto y la coma se usan al revés según de dónde venga el dato, así que
 * la regla es la posición: un grupo final de exactamente tres dígitos es un
 * separador de miles ("13.000" y "13,000" son trece mil), y cualquier otro
 * grupo final es la parte decimal ("15.500,50", "13,5").
 */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[\s$]/g, '')
  const sign = cleaned.startsWith('-') ? -1 : 1
  if (!cleaned) return null
  const lastDot = cleaned.lastIndexOf('.')
  const lastComma = cleaned.lastIndexOf(',')
  const cut = Math.max(lastDot, lastComma)
  let normalized: string
  if (cut === -1) {
    normalized = cleaned
  } else {
    const tail = cleaned.slice(cut + 1)
    normalized = /^\d{3}$/.test(tail)
      ? cleaned.replace(/[.,]/g, '') // separador de miles
      : `${cleaned.slice(0, cut).replace(/[.,]/g, '')}.${tail}`
  }
  const n = Number(normalized.replace(/^-/, '')) * sign
  return Number.isFinite(n) ? n : null
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Rango consumido por un campo, para poder sacarlo del nombre. */
interface Span {
  start: number
  end: number
}

function overlaps(a: Span, b: Span): boolean {
  return a.start < b.end && b.start < a.end
}

/**
 * Interpreta una línea. Devuelve `null` si no hay nada aprovechable.
 */
export function parseLine(raw: string): ParsedLine | null {
  const line = raw.trim()
  if (!line) return null
  const { text, map } = fold(line)

  const taken: Span[] = []
  const out: ParsedLine = { raw: line, name: '', categoryGuessed: false, warnings: [] }

  /** Traduce un rango del texto plegado al original. */
  const toRaw = (start: number, end: number): Span => ({
    start: map[start],
    end: (map[end - 1] ?? map[start]) + 1,
  })

  // ---- Campos numéricos --------------------------------------------------
  // Los sinónimos ya vienen del más largo al más corto, y cada tramo se marca
  // como usado, así "precio de venta" no vuelve a matchear como "venta".
  for (const { field, words } of LEXICON) {
    if (out[field] !== undefined) continue
    for (const word of words) {
      // El signo se acepta para poder avisar del disparate, no para guardarlo:
      // sin esto "stock -5" no matcheaba y "stock" terminaba dentro del nombre.
      const re = new RegExp(`${escapeRe(word)}\\s*(?:de|a|en|es|:|=)?\\s*\\$?\\s*(-?\\s*(?:${NUMBER}))`, 'g')
      let m: RegExpExecArray | null
      let done = false
      while (!done && (m = re.exec(text)) !== null) {
        const span = toRaw(m.index, m.index + m[0].length)
        if (taken.some((t) => overlaps(t, span))) continue
        const value = parseNumber(m[1])
        if (value === null) continue
        out[field] = value
        taken.push(span)
        done = true
      }
      if (done) break
    }
  }

  // ---- Categoría nombrada ------------------------------------------------
  for (const word of CATEGORY_WORDS) {
    const re = new RegExp(`${escapeRe(word)}\\s*:?\\s*([a-z]+)`, 'g')
    const m = re.exec(text)
    if (!m) continue
    const span = toRaw(m.index, m.index + m[0].length)
    if (taken.some((t) => overlaps(t, span))) continue
    out.category = m[1]
    taken.push(span)
    break
  }

  // ---- Nombre ------------------------------------------------------------
  // Lo que sobra después de sacar los tramos reconocidos.
  taken.sort((a, b) => a.start - b.start)
  let name = ''
  let cursor = 0
  for (const span of taken) {
    name += line.slice(cursor, span.start)
    cursor = Math.max(cursor, span.end)
  }
  name += line.slice(cursor)
  out.name = name
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;.:\-–—]+|[\s,;.:\-–—]+$/g, '')
    .trim()

  // ---- Categoría inferida ------------------------------------------------
  if (!out.category) {
    const guessed = guessCategory(out.name)
    if (guessed) {
      out.category = guessed
      out.categoryGuessed = true
    }
  }

  const hasSomething = out.name !== '' || out.cost !== undefined || out.price !== undefined || out.stock !== undefined
  if (!hasSomething) return null

  // ---- Avisos ------------------------------------------------------------
  if (!out.name) out.warnings.push('No pude leer el nombre del producto.')
  if (out.price !== undefined && out.cost !== undefined && out.price < out.cost) {
    out.warnings.push('El precio de venta es menor al de proveedor: así perdés plata en cada venta.')
  }
  if (out.price === 0) out.warnings.push('El precio de venta quedó en $0.')
  if (out.stock !== undefined && !Number.isInteger(out.stock)) {
    out.warnings.push('El stock tiene decimales; lo redondeo.')
    out.stock = Math.round(out.stock)
  }
  if (out.stock !== undefined && out.stock < 0) {
    out.warnings.push('El stock no puede ser negativo; lo dejo en 0.')
    out.stock = 0
  }
  return out
}

/** Categoría deducida del nombre, o `null` si ninguna pista alcanza. Es una
 *  ayuda, no una decisión: quien la use tiene que dejar cambiarla. */
export function guessCategory(name: string): string | null {
  const folded = fold(name).text
  for (const [re, slug] of CATEGORY_HINTS) {
    if (re.test(folded)) return slug
  }
  return null
}

/** Cada línea no vacía es un producto. Permite pegar una lista entera. */
export function parseLines(input: string): ParsedLine[] {
  return input
    .split(/\r?\n/)
    .map(parseLine)
    .filter((p): p is ParsedLine => p !== null)
}

// ---- Búsqueda del producto existente --------------------------------------

function normalizeName(s: string): string {
  return fold(s).text.replace(/[^a-z0-9]+/g, '')
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s} `
  const out = new Set<string>()
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3))
  return out
}

/** Coeficiente de Dice sobre trigramas: tolera plurales y palabras de más,
 *  que es justo lo que separa "guantes negros" de "Guantes negros x100". */
export function similarity(a: string, b: string): number {
  const x = normalizeName(a)
  const y = normalizeName(b)
  if (!x || !y) return 0
  if (x === y) return 1
  const A = trigrams(x)
  const B = trigrams(y)
  let shared = 0
  for (const t of A) if (B.has(t)) shared += 1
  return (2 * shared) / (A.size + B.size)
}

/** Por debajo de esto ni se ofrece: sería ruido. */
export const MIN_SIMILARITY = 0.45

/** Tan parecido que casi seguro es el mismo producto. Igual se confirma. */
export const STRONG_SIMILARITY = 0.8

export interface Candidate {
  product: Product
  score: number
}

/** Productos parecidos, del más probable al menos, sin pasar de `limit`. */
export function findCandidates(name: string, products: Product[], limit = 3): Candidate[] {
  if (!name.trim()) return []
  return products
    .map((product) => ({ product, score: similarity(name, product.name) }))
    .filter((c) => c.score >= MIN_SIMILARITY)
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
}

/** Slug a partir del nombre, igual que en el formulario de productos. */
export function slugify(text: string): string {
  return fold(text)
    .text.replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Un slug libre: si "guantes-negros" ya existe, prueba "guantes-negros-2". */
export function uniqueSlug(name: string, products: Product[]): string {
  const base = slugify(name) || 'producto'
  const used = new Set(products.map((p) => p.slug))
  if (!used.has(base)) return base
  for (let i = 2; i < 500; i++) {
    const candidate = `${base}-${i}`
    if (!used.has(candidate)) return candidate
  }
  return `${base}-${Date.now()}`
}
