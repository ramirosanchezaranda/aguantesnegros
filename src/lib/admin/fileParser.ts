// Lectura de listas de proveedor: CSV, TSV, texto plano y PDF.
//
// La interfaz (parseCSV / parsePDF / parseExcel / ParsedProduct) es la que
// consume AdminAssistant. Por dentro delega en `productImport`, que lee la
// tabla por columna cuando hay encabezados y cae al parser de texto suelto
// cuando no, y en `pdfText`, que reconstruye los renglones del PDF.
//
// Ese último punto es el que decide si esto sirve o no. Un PDF entrega
// fragmentos sueltos con su posición: pegarlos con un espacio convierte una
// fila de tabla en "Vaselina Chica 4.990" y no queda forma de distinguir el
// precio del gramaje, así que se terminaba leyendo "65" de "65ML" como si
// fuera el precio. Agrupando por coordenada vertical y traduciendo los huecos
// horizontales a tabulaciones, el PDF se lee por columna igual que un CSV.

import { importText } from '../productImport'
import { looksEmpty, pdfToText } from '../pdfText'
import type { ParsedLine } from '../productCommand'

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

function toProducts(lines: ParsedLine[]): ParsedProduct[] {
  return lines.map((l) => ({
    name: l.name,
    price: l.price,
    cost: l.cost,
    stock: l.stock,
    category: l.category,
  }))
}

/** CSV, TSV o texto: separador y encabezados se detectan solos. */
export async function parseCSV(file: File): Promise<ParsedProduct[]> {
  const result = importText(await file.text())
  if (result.lines.length === 0) {
    throw new Error(
      'No pude sacar ningún producto del archivo. Fijate que tenga una columna de nombre y otra de precio.',
    )
  }
  return toProducts(result.lines)
}

/** Excel todavía no: hace falta una librería aparte para leer .xlsx. */
export async function parseExcel(_file: File): Promise<ParsedProduct[]> {
  throw new Error('Excel todavía no está soportado. Guardalo como CSV y volvé a probar.')
}

/** PDF con texto. Los escaneados no tienen nada que extraer sin OCR. */
export async function parsePDF(file: File): Promise<ParsedProduct[]> {
  const text = await pdfToText(file)
  if (looksEmpty(text)) {
    throw new Error(
      'Ese PDF no tiene texto: son imágenes escaneadas. Sin un lector de OCR no hay nada que extraer. Probá con el CSV o el Excel original.',
    )
  }
  const result = importText(text)
  if (result.lines.length === 0) {
    throw new Error('Leí el PDF pero no reconocí ningún producto con precio.')
  }
  return toProducts(result.lines)
}
