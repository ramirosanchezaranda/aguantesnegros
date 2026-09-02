// Texto de un PDF, en el navegador.
//
// pdf.js se carga sólo cuando alguien adjunta un PDF: pesa cerca de un mega y
// no tiene por qué viajar en el bundle de una tienda que casi nunca lo usa.

/** Un PDF de lista de precios rara vez pasa de esto. El límite evita colgar
 *  el navegador con un catálogo entero escaneado. */
const MAX_PAGES = 40

interface TextItem {
  str: string
  /** Ancho del fragmento, para saber dónde termina. */
  width: number
  /** Alto de la fuente: sirve de escala para decidir qué es un espacio. */
  height: number
  transform: number[]
}

/**
 * Devuelve el texto del PDF, un renglón por línea visual y las columnas
 * separadas por tabulación.
 *
 * pdf.js entrega fragmentos sueltos con su posición, no renglones. Pegarlos de
 * corrido perdería justamente lo que hace falta acá —qué precio va con qué
 * producto—, así que se agrupan por su coordenada vertical y se ordenan por la
 * horizontal, que reconstruye la fila tal como se ve.
 *
 * Y en una lista de precios las columnas no están separadas por ningún
 * carácter: están separadas por espacio en blanco. Si se pegaran con un espacio
 * común, "Guantes x100 13.000 15.500 40" sería indistinguible de una frase y no
 * habría forma de saber qué número es el costo. Por eso un hueco horizontal
 * grande se traduce a una tabulación: eso convierte el PDF en una tabla que se
 * puede leer por columna, igual que un CSV.
 */
export async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  // El worker se sirve desde el mismo build; sin esto pdf.js intenta buscarlo
  // en un CDN y falla en producción.
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false }).promise
  const pages = Math.min(doc.numPages, MAX_PAGES)
  const out: string[] = []

  for (let n = 1; n <= pages; n++) {
    const page = await doc.getPage(n)
    const content = await page.getTextContent()
    const items = content.items as unknown as TextItem[]

    // Agrupar por renglón. La tolerancia absorbe las diferencias mínimas de
    // línea base entre fragmentos de una misma fila.
    const rows = new Map<number, { x: number; end: number; size: number; str: string }[]>()
    for (const item of items) {
      if (!item.str.trim()) continue
      const y = Math.round(item.transform[5] / 3) * 3
      const x = item.transform[4]
      const row = rows.get(y) ?? []
      row.push({ x, end: x + (item.width ?? 0), size: item.height || 10, str: item.str })
      rows.set(y, row)
    }

    // De arriba hacia abajo: en PDF la Y crece hacia arriba.
    const ordered = [...rows.entries()].sort((a, b) => b[0] - a[0])
    for (const [, row] of ordered) {
      const cells = row.sort((a, b) => a.x - b.x)
      let line = ''
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]
        if (i > 0) {
          const gap = cell.x - cells[i - 1].end
          // Un espacio entre palabras ronda un cuarto del cuerpo de la letra.
          // Bastante más que eso ya es una columna, no una palabra siguiente.
          line += gap > cells[i - 1].size * 0.9 ? '\t' : ' '
        }
        line += cell.str.trim()
      }
      line = line.replace(/[ \t]*\t[ \t]*/g, '\t').replace(/ +/g, ' ').trim()
      if (line) out.push(line)
    }
    page.cleanup()
  }

  await doc.destroy()
  if (doc.numPages > pages) {
    out.push(`(Se leyeron las primeras ${pages} páginas de ${doc.numPages}.)`)
  }
  return out.join('\n')
}

/** Un PDF de imágenes escaneadas no tiene texto que extraer. */
export function looksEmpty(text: string): boolean {
  return text.replace(/\s/g, '').length < 20
}
