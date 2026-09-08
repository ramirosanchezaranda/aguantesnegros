import {
  CATEGORIES,
  DEFAULT_STOCK,
  PRODUCTS,
  type ArtKind,
  type Category,
  type MascotVariant,
  type Product,
} from '../../data/catalog'
import { compressImage } from '../images'
import { publicStorageUrl, restUrl, sbAdminHeaders, sbHeaders, storageUrl } from '../supabase'
import type { CatalogRepo } from './types'

/* Columnas en Postgres (snake_case) <-> tipos de la app (camelCase). */

interface ProductRow {
  slug: string
  name: string
  brand: string
  price: number
  compare_at: number | null
  category: string
  art: string
  rating: number
  reviews: number
  badge: string | null
  featured: boolean | null
  description: string
  specs: [string, string][] | null
  stock: number | null
  image_urls: string[] | null
  colors: string[] | null
  cost: number | null
  /** Columna de la primera versión, con una sola foto. Se lee por compatibilidad. */
  image_url?: string | null
}

/** Bucket público donde viven las fotos de producto. */
const IMAGE_BUCKET = 'product-images'

function rowToProduct(r: ProductRow): Product {
  return {
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    price: r.price,
    compareAt: r.compare_at ?? undefined,
    category: r.category,
    art: r.art as ArtKind,
    rating: r.rating,
    reviews: r.reviews,
    badge: r.badge ?? undefined,
    featured: r.featured ?? undefined,
    description: r.description,
    specs: r.specs ?? [],
    stock: r.stock ?? DEFAULT_STOCK,
    images: r.image_urls?.length ? r.image_urls : r.image_url ? [r.image_url] : undefined,
    colors: r.colors?.length ? r.colors : undefined,
    cost: r.cost ?? undefined,
  }
}

function productToRow(p: Product): ProductRow {
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    price: p.price,
    compare_at: p.compareAt ?? null,
    category: p.category,
    art: p.art,
    rating: p.rating,
    reviews: p.reviews,
    badge: p.badge ?? null,
    featured: p.featured ?? false,
    description: p.description,
    specs: p.specs,
    stock: p.stock ?? DEFAULT_STOCK,
    image_urls: p.images ?? [],
    colors: p.colors ?? [],
    cost: p.cost ?? null,
  }
}

interface CategoryRow {
  slug: string
  name: string
  tagline: string
  mascot: string
  art: string
}

function rowToCategory(r: CategoryRow): Category {
  return { slug: r.slug, name: r.name, tagline: r.tagline, mascot: r.mascot as MascotVariant, art: r.art as ArtKind }
}

async function ensureOk(res: Response, action: string): Promise<void> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${action} falló (${res.status}): ${body || res.statusText}`)
  }
}

/**
 * Comprueba que la escritura haya tocado alguna fila.
 *
 * PostgREST responde 204 aunque las políticas de la base hayan filtrado todo,
 * así que sin esto un borrado que no borró nada se ve como un éxito. Con
 * `Prefer: return=representation` devuelve las filas afectadas y se puede
 * contar: cero filas es un fallo, no un éxito silencioso.
 */
async function ensureTouched(res: Response, action: string): Promise<void> {
  await ensureOk(res, action)
  if (res.status === 204) return // el servidor no devolvió cuerpo: no hay nada que contar
  const rows = (await res.json().catch(() => null)) as unknown
  if (Array.isArray(rows) && rows.length === 0) {
    throw new Error(
      `${action}: el servidor no aplicó el cambio. Suele ser la sesión vencida: cerrá sesión, volvé a entrar y probá de nuevo.`,
    )
  }
}

export function createSupabaseRepo(): CatalogRepo {
  return {
    // Semilla como placeholder hasta que resuelva el primer fetch.
    snapshot: () => ({
      products: PRODUCTS.map((p) => ({ ...p, stock: p.stock ?? DEFAULT_STOCK })),
      categories: CATEGORIES.map((c) => ({ ...c })),
    }),

    async listProducts() {
      const res = await fetch(restUrl('products?select=*&order=name.asc'), { headers: await sbHeaders() })
      await ensureOk(res, 'Listar productos')
      return ((await res.json()) as ProductRow[]).map(rowToProduct)
    },

    async listCategories() {
      const res = await fetch(restUrl('categories?select=*&order=name.asc'), { headers: await sbHeaders() })
      await ensureOk(res, 'Listar categorías')
      return ((await res.json()) as CategoryRow[]).map(rowToCategory)
    },

    async saveProduct(product) {
      const res = await fetch(restUrl('products?on_conflict=slug&select=slug'), {
        method: 'POST',
        headers: await sbAdminHeaders({
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(productToRow(product)),
      })
      await ensureTouched(res, 'Guardar producto')
    },

    async deleteProduct(slug) {
      const res = await fetch(restUrl(`products?slug=eq.${encodeURIComponent(slug)}&select=slug`), {
        method: 'DELETE',
        headers: await sbAdminHeaders({ Prefer: 'return=representation' }),
      })
      await ensureTouched(res, 'Eliminar producto')
    },

    async saveCategory(category) {
      const res = await fetch(restUrl('categories?on_conflict=slug&select=slug'), {
        method: 'POST',
        headers: await sbAdminHeaders({
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(category),
      })
      await ensureTouched(res, 'Guardar categoría')
    },

    async deleteCategory(slug) {
      const res = await fetch(restUrl(`categories?slug=eq.${encodeURIComponent(slug)}&select=slug`), {
        method: 'DELETE',
        headers: await sbAdminHeaders({ Prefer: 'return=representation' }),
      })
      await ensureTouched(res, 'Eliminar categoría')
    },

    async uploadImage(slug, file) {
      const blob = await compressImage(file)
      // Nombre nuevo en cada subida: si reusáramos el mismo, el CDN podría
      // seguir sirviendo la imagen anterior durante un buen rato.
      const path = `${slug}-${Date.now()}.webp`
      const res = await fetch(storageUrl(IMAGE_BUCKET, path), {
        method: 'POST',
        headers: await sbAdminHeaders({ 'Content-Type': 'image/webp' }),
        body: blob,
      })
      await ensureOk(res, 'Subir la imagen')
      return publicStorageUrl(IMAGE_BUCKET, path)
    },
  }
}
