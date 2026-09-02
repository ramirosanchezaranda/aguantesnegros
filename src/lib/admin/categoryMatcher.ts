import Fuse from 'fuse.js'
import type { Category } from '../../data/catalog'

/**
 * Detecta automáticamente la categoría más probable basada en el nombre del producto.
 * Usa fuzzy matching para ser predictivo.
 */
export function guessCategory(productName: string, categories: Category[]): string | null {
  if (!productName.trim()) return null

  const fuse = new Fuse(categories, {
    keys: ['name', 'tagline'],
    threshold: 0.4, // 0 = exact, 1 = loose
    minMatchCharLength: 2,
  })

  const results = fuse.search(productName)
  return results.length > 0 ? results[0].item.slug : null
}

/**
 * Sugiere una categoría si la confianza es alta (threshold > 0.6).
 * Retorna null si la confianza es baja.
 */
export function suggestCategory(productName: string, categories: Category[]): { slug: string; confidence: number } | null {
  if (!productName.trim()) return null

  const fuse = new Fuse(categories, {
    keys: ['name', 'tagline'],
    threshold: 0.6,
    minMatchCharLength: 2,
  })

  const results = fuse.search(productName)
  if (results.length === 0) return null

  const score = 1 - (results[0].score ?? 0)
  return {
    slug: results[0].item.slug,
    confidence: Math.round(score * 100),
  }
}
