import { CATEGORIES, DEFAULT_STOCK, PRODUCTS, type Category, type Product } from '../../data/catalog'
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
  write(fresh)
  return fresh
}

function write(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* almacenamiento no disponible */
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
  }
}
