import { CATEGORIES, DEFAULT_STOCK, PRODUCTS, type Category, type Product } from '../../data/catalog'
import { blobToDataUrl, compressImage } from '../images'
import type { CatalogRepo } from './types'

const KEY = 'agn-catalog-v2'

interface Store {
  products: Product[]
  categories: Category[]
}

function seed(): Store {
  return {
    products: PRODUCTS.map((p) => ({ ...p, stock: p.stock ?? DEFAULT_STOCK })),
    categories: CATEGORIES.map((c) => ({ ...c })),
  }
}

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Store
      if (parsed?.products && parsed?.categories) return parsed
    }
  } catch {
    /* datos corruptos: re-sembramos */
  }
  const fresh = seed()
  try {
    write(fresh)
  } catch {
    /* sin almacenamiento: seguimos sólo en memoria */
  }
  return fresh
}

function write(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    // Se propaga: si no avisamos, el panel diría "guardado" y no persistiría
    // nada. Pasa sobre todo al pegar imágenes, que llenan la cuota.
    throw new Error(
      'No se pudo guardar: el almacenamiento del navegador está lleno. ' +
        'Probá con una imagen más liviana, o conectá Supabase para no depender del navegador.',
    )
  }
}

/** Borra la copia local y vuelve al catálogo semilla. */
export function resetLocalCatalog(): void {
  write(seed())
}

export function createLocalRepo(): CatalogRepo {
  return {
    snapshot: () => read(),
    async listProducts() {
      return read().products
    },
    async listCategories() {
      return read().categories
    },
    async saveProduct(product) {
      const store = read()
      const i = store.products.findIndex((p) => p.slug === product.slug)
      if (i >= 0) store.products[i] = product
      else store.products.push(product)
      write(store)
    },
    async deleteProduct(slug) {
      const store = read()
      store.products = store.products.filter((p) => p.slug !== slug)
      write(store)
    },
    async saveCategory(category) {
      const store = read()
      const i = store.categories.findIndex((c) => c.slug === category.slug)
      if (i >= 0) store.categories[i] = category
      else store.categories.push(category)
      write(store)
    },
    async deleteCategory(slug) {
      const store = read()
      store.categories = store.categories.filter((c) => c.slug !== slug)
      write(store)
    },
    async uploadImage(_slug, file) {
      // Sin backend la imagen vive dentro del propio catálogo en localStorage,
      // así que se comprime más fuerte que contra Supabase para no comerse la
      // cuota (unos 5 MB para todo el navegador).
      const blob = await compressImage(file, { maxSide: 520, quality: 0.72 })
      return blobToDataUrl(blob)
    },
  }
}
