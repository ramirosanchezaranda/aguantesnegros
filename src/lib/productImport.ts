// Lectura de listas de proveedor: CSV, TSV y el texto que sale de un PDF.
//
// La lista de un proveedor casi nunca viene en el mismo formato dos veces, así
// que hay dos caminos. Si el archivo tiene encabezados reconocibles se leen
// por columna, que es exacto. Si no —un PDF, un CSV sin títulos—, cada renglón
// se pasa por el mismo parser de texto suelto que usa el chat. En los dos
// casos el resultado son las mismas fichas editables: el archivo propone,
// la persona confirma.

import { guessCategory, parseLine, parseNumber, type ParsedLine } from './productCommand'

/** Campos que sabemos mapear desde una columna. */
type Field = 'name' | 'cost' | 'price' | 'stock' | 'category'

/** Títulos de columna por campo, del más específico al más general. */
const HEADERS: [Field, string[]][] = [
  ['cost', ['precio de proveedor', 'precio proveedor', 'precio de costo', 'precio costo', 'costo unitario', 'proveedor', 'costo', 'coste', 'compra']],
  ['price', ['precio de venta', 'precio venta', 'precio al publico', 'precio publico', 'venta', 'pvp', 'publico', 'precio']],
  ['stock', ['unidades', 'cantidad', 'stock', 'unid', 'cant', 'existencias', 'u']],
  ['category', ['categoria', 'rubro', 'familia']],
  ['name', ['producto', 'nombre', 'descripcion', 'detalle', 'articulo', 'item', 'insumo']],
]

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/** Qué campo representa un título de columna, si representa alguno. */
function fieldOf(header: string): Field | null {
  const h = fold(header)
  if (!h) return null
  for (const [field, words] of HEADERS) {
    // Igual exacto primero: una columna "precio" no debería ganarle a "costo"
    // sólo porque "precio" aparece dentro de "precio de costo".
    if (words.includes(h)) return field
  }
  for (const [field, words] of HEADERS) {
    if (words.some((w) => h.includes(w))) return field
  }
  return null
}

/** Separador más probable. El punto y coma es habitual acá, justamente
 *  porque la coma se usa para los decimales. */
export function sniffDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 15)
  if (sample.length === 0) return ','
  let best = { d: ',', score: 0 }
  for (const d of [';', '\t', ',', '|']) {
    const per = sample.map((l) => l.split(d).length - 1).filter((n) => n > 0)
    if (per.length < 2) continue
    // Las filas de datos tienen todas la misma cantidad de separadores. Se
    // busca esa cantidad repetida, no el promedio: los archivos reales traen
    // arriba el nombre del proveedor o una fecha, y exigirle el separador a
    // cada renglón haría que no se detecte ninguno.
    const tally = new Map<number, number>()
    for (const n of per) tally.set(n, (tally.get(n) ?? 0) + 1)
    const [count, rows] = [...tally.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]
    const score = rows * count
    if (score > best.score) best = { d, score }
  }
  return best.score > 0 ? best.d : ','
}

/** Una fila de CSV, respetando comillas y comas dentro de comillas. */
function splitRow(line: string, delimiter: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else quoted = false
      } else cur += ch
    } else if (ch === '"') {
      quoted = true
    } else if (ch === delimiter) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

export interface ImportResult {
  lines: ParsedLine[]
  /** Renglones que no dieron nada, para poder mostrarlos. */
  skipped: string[]
  /** Cómo se leyó, para que se vea y se pueda desconfiar. */
  how: string
  warnings: string[]
}

/**
 * Lee una tabla con encabezados. Devuelve `null` si no los reconoce, para que
 * el llamador use el camino de texto suelto.
 */
function readAsTable(text: string): ImportResult | null {
  const rows = text.split(/\r?\n/).filter((l) => l.trim())
  if (rows.length < 2) return null
  const delimiter = sniffDelimiter(text)

  // El encabezado puede no ser el primer renglón: muchas listas arrancan con
  // el nombre del proveedor o una fecha. Se busca en los primeros.
  let headerAt = -1
  let columns: (Field | null)[] = []
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const cells = splitRow(rows[i], delimiter)
    if (cells.length < 2) continue
    const mapped = cells.map(fieldOf)
    const named = mapped.filter(Boolean).length
    // Hace falta el nombre y al menos un número para que valga la pena.
    if (mapped.includes('name') && named >= 2) {
      headerAt = i
      columns = mapped
      break
    }
  }
  if (headerAt === -1) return null

  const warnings: string[] = []
  const skipped: string[] = []
  const lines: ParsedLine[] = []
  const used = new Map<Field, number>()
  columns.forEach((f, i) => {
    if (f && !used.has(f)) used.set(f, i)
  })

  for (let i = headerAt + 1; i < rows.length; i++) {
    const raw = rows[i]
    const cells = splitRow(raw, delimiter)
    const cell = (f: Field) => {
      const idx = used.get(f)
      return idx === undefined ? '' : (cells[idx] ?? '').trim()
    }
    const name = cell('name')
    if (!name) {
      skipped.push(raw)
      continue
    }
    const numOf = (f: Field) => {
      const v = cell(f)
      if (!v) return undefined
      const n = parseNumber(v)
      return n === null ? undefined : n
    }
    // Sin columna de categoría se deduce del nombre, igual que al escribirlo a
    // mano. Sin esto una lista de PDF cargaría todo en la primera categoría.
    const written = cell('category') ? fold(cell('category')) : ''
    const guessed = written ? null : guessCategory(name)
    const line: ParsedLine = {
      raw,
      name,
      cost: numOf('cost'),
      price: numOf('price'),
      stock: numOf('stock'),
      category: written || guessed || undefined,
      categoryGuessed: !written && guessed !== null,
      warnings: [],
    }
    if (line.cost === undefined && line.price === undefined && line.stock === undefined) {
      skipped.push(raw)
      continue
    }
    if (line.price !== undefined && line.cost !== undefined && line.price < line.cost) {
      line.warnings.push('El precio de venta es menor al de proveedor.')
    }
    if (line.stock !== undefined) line.stock = Math.max(0, Math.round(line.stock))
    lines.push(line)
  }

  if (!used.has('price') && !used.has('cost')) {
    warnings.push('No encontré ninguna columna de precio.')
  }
  const found = [...used.entries()]
    .map(([f, i]) => `${LABEL[f]} → columna ${i + 1}`)
    .join(', ')
  return {
    lines,
    skipped,
    how: `Leí una tabla separada por "${delimiter === '\t' ? 'tabulación' : delimiter}": ${found}.`,
    warnings,
  }
}

const LABEL: Record<Field, string> = {
  name: 'Nombre',
  cost: 'Costo',
  price: 'Venta',
  stock: 'Stock',
  category: 'Categoría',
}

/** Camino de texto suelto: cada renglón por el parser del chat. */
function readAsText(text: string): ImportResult {
  const rows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const lines: ParsedLine[] = []
  const skipped: string[] = []
  for (const row of rows) {
    const parsed = parseLine(row)
    if (parsed && (parsed.cost !== undefined || parsed.price !== undefined || parsed.stock !== undefined)) {
      lines.push(parsed)
    } else {
      skipped.push(row)
    }
  }
  return {
    lines,
    skipped,
    how: 'No encontré encabezados de columna, así que leí renglón por renglón como si lo hubieras escrito.',
    warnings: [],
  }
}

/** Punto de entrada: tabla si se puede, texto suelto si no. */
export function importText(text: string): ImportResult {
  return readAsTable(text) ?? readAsText(text)
}
