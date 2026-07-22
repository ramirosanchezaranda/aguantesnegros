// Imagen de producto real (ilustración estilo marca), elegida por la
// categoría del producto. Reemplaza las ilustraciones SVG genéricas.

const CATEGORIES = new Set([
  'descartables',
  'agujas',
  'cartuchos',
  'punteras',
  'pigmentos',
  'anestesia',
  'aftercare',
  'varios',
])

export default function ProductArt({ category, className }: { category: string; className?: string }) {
  const src = CATEGORIES.has(category) ? `/products/${category}.png` : '/products/default.png'
  return <img src={src} className={`product-art ${className ?? ''}`} alt="" aria-hidden="true" draggable={false} />
}
