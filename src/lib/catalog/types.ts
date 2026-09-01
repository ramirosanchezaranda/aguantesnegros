import type { Category, Product } from '../../data/catalog'

export interface CatalogRepo {
  /** Instantánea síncrona para el primer render (puede ser el catálogo semilla). */
  snapshot(): { products: Product[]; categories: Category[] }
  listProducts(): Promise<Product[]>
  listCategories(): Promise<Category[]>
  saveProduct(product: Product): Promise<void>
  deleteProduct(slug: string): Promise<void>
  saveCategory(category: Category): Promise<void>
  deleteCategory(slug: string): Promise<void>
  /**
   * Sube la imagen de un producto y devuelve la URL con la que mostrarla.
   * Contra Supabase va a Storage; en modo local queda como data URL.
   */
  uploadImage(slug: string, file: File): Promise<string>
}
