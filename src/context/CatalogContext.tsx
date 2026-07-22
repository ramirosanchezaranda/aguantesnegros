import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getRepo } from '../lib/catalog'
import type { Category, Product } from '../data/catalog'

interface CatalogValue {
  products: Product[]
  categories: Category[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  getProduct: (slug: string) => Product | undefined
  getCategory: (slug: string) => Category | undefined
  productsByCategory: (slug: string) => Product[]
}

const Ctx = createContext<CatalogValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const repo = getRepo()
  const [snap] = useState(() => repo.snapshot())
  const [products, setProducts] = useState<Product[]>(snap.products)
  const [categories, setCategories] = useState<Category[]>(snap.categories)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, c] = await Promise.all([repo.listProducts(), repo.listCategories()])
      setProducts(p)
      setCategories(c)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo')
    } finally {
      setLoading(false)
    }
  }, [repo])

  useEffect(() => {
    void reload()
  }, [reload])

  const value = useMemo<CatalogValue>(
    () => ({
      products,
      categories,
      loading,
      error,
      reload,
      getProduct: (slug) => products.find((p) => p.slug === slug),
      getCategory: (slug) => categories.find((c) => c.slug === slug),
      productsByCategory: (slug) => products.filter((p) => p.category === slug),
    }),
    [products, categories, loading, error, reload],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCatalog() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCatalog fuera de CatalogProvider')
  return v
}
