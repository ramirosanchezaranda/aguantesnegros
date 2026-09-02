import Fuse from 'fuse.js'
import type { Product } from '../../data/catalog'

export interface DuplicateMatch {
  product: Product
  similarity: number
}

/**
 * Detecta si un producto similar ya existe.
 * Retorna el más similar con score de confianza (0-100).
 */
export function findDuplicate(productName: string, products: Product[]): DuplicateMatch | null {
  if (!productName.trim() || products.length === 0) return null

  const fuse = new Fuse(products, {
    keys: ['name', 'brand'],
    threshold: 0.5, // Detecta similares pero no idénticos
    minMatchCharLength: 3,
  })

  const results = fuse.search(productName)
  if (results.length === 0) return null

  const best = results[0]
  const similarity = Math.round((1 - (best.score ?? 0)) * 100)

  // Solo retorna si la similitud es suficientemente alta (>60%)
  return similarity > 60 ? { product: best.item, similarity } : null
}

/**
 * Busca productos que coincidan exactamente o casi exactamente.
 * Útil para validar antes de crear/actualizar.
 */
export function findSimilarProducts(productName: string, products: Product[], threshold = 0.6): DuplicateMatch[] {
  if (!productName.trim() || products.length === 0) return []

  const fuse = new Fuse(products, {
    keys: ['name', 'brand'],
    threshold: threshold,
    minMatchCharLength: 2,
  })

  return fuse.search(productName).map((result) => ({
    product: result.item,
    similarity: Math.round((1 - (result.score ?? 0)) * 100),
  }))
}
