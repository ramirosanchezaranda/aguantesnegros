import Papa from 'papaparse'
import * as pdfjsLib from 'pdfjs-dist'

// Set up worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface ParsedProduct {
  name: string
  brand?: string
  price?: number
  cost?: number
  stock?: number
  category?: string
  description?: string
  specs?: [string, string][]
}

/**
 * Parsea un archivo CSV y extrae filas como potenciales productos.
 * Trata de mapear automáticamente columnas comunes.
 */
export async function parseCSV(file: File): Promise<ParsedProduct[]> {
  const text = await file.text()
  return new Promise((resolve, reject) => {
    ;(Papa.parse as any)(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const products = (results.data as Record<string, string>[])
          .filter((row: Record<string, string>) => Object.values(row).some((v) => v && v.trim()))
          .map((row: Record<string, string>) => mapRowToProduct(row))

        resolve(products)
      },
      error: (error: any) => reject(new Error(`Error parseando CSV: ${error.message}`)),
    })
  })
}

/**
 * Parsea un archivo Excel (.xlsx).
 * Nota: Requiere librería adicional. Por ahora retorna error.
 */
export async function parseExcel(file: File): Promise<ParsedProduct[]> {
  // Para Excel necesitaría 'xlsx' o 'exceljs'
  // Por ahora, sugerimos convertir a CSV en el frontend
  throw new Error('Excel aún no está soportado. Por favor convertí el archivo a CSV.')
}

/**
 * Parsea un archivo PDF y extrae texto.
 * Intenta encontrar patrones de productos (nombre + precio).
 */
export async function parsePDF(file: File): Promise<ParsedProduct[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return extractProductsFromText(fullText)
}

/**
 * Mapea una fila de CSV/Excel a un producto.
 * Busca columnas comunes: name, product, nombre, price, precio, cost, costo, etc.
 */
function mapRowToProduct(row: Record<string, string>): ParsedProduct {
  const keys = Object.keys(row).map((k) => k.toLowerCase())
  const getKeyValue = (key: string | undefined): string => {
    if (!key) return ''
    const originalKey = Object.keys(row).find((k) => k.toLowerCase() === key)
    return originalKey ? row[originalKey]?.trim() ?? '' : ''
  }

  const getName = () => {
    const nameKey = keys.find((k) => k.includes('name') || k.includes('producto') || k.includes('nombre'))
    return getKeyValue(nameKey)
  }

  const getNumber = (patterns: string[]): number | undefined => {
    const key = keys.find((k) => patterns.some((p) => k.includes(p)))
    if (!key) return undefined
    const originalKey = Object.keys(row).find((k) => k.toLowerCase() === key)
    if (!originalKey) return undefined
    const val = parseFloat(row[originalKey])
    return isNaN(val) ? undefined : val
  }

  const brandKey = keys.find((k) => k.includes('brand') || k.includes('marca'))
  const categoryKey = keys.find((k) => k.includes('category') || k.includes('categoría'))
  const descKey = keys.find((k) => k.includes('description') || k.includes('descripción'))

  return {
    name: getName(),
    brand: getKeyValue(brandKey),
    price: getNumber(['price', 'precio', 'venta']),
    cost: getNumber(['cost', 'costo', 'compra']),
    stock: getNumber(['stock', 'cantidad']),
    category: getKeyValue(categoryKey),
    description: getKeyValue(descKey),
  }
}

/**
 * Extrae productos potenciales de texto plano (ej: de un PDF).
 * Busca patrones como: "Nombre $100" o "Producto - Precio"
 */
function extractProductsFromText(text: string): ParsedProduct[] {
  const products: ParsedProduct[] = []

  // Patrón: "Nombre $100" o "Nombre - $100" o similar
  const pricePattern = /(.+?)[\s-]*\$?(\d+(?:\.\d{2})?)/g
  let match

  while ((match = pricePattern.exec(text)) !== null) {
    const name = match[1].trim()
    const price = parseFloat(match[2])

    // Valida que sea un nombre sensato (al menos 2 caracteres)
    if (name.length >= 2 && !name.match(/^\d/) && price > 0) {
      products.push({
        name,
        price: Math.round(price),
      })
    }
  }

  // Si no encontró nada, retorna líneas que parecen nombres de productos
  if (products.length === 0) {
    const lines = text.split(/[\n\r]+/).filter((l) => l.trim().length > 2)
    return lines.slice(0, 20).map((name) => ({ name }))
  }

  return products
}
