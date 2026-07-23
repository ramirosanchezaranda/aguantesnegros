// Imagen de producto real (ilustración estilo marca), elegida por la
// categoría del producto. Reemplaza las ilustraciones SVG genéricas.
//
// Se usan rutas literales (no un template `/products/${cat}.png`) para que
// el bundler las resuelva estáticamente y puedan inlinearse en la preview.

const IMAGES: Record<string, string> = {
  descartables: '/products/descartables.png',
  agujas: '/products/agujas.png',
  cartuchos: '/products/cartuchos.png',
  punteras: '/products/punteras.png',
  pigmentos: '/products/pigmentos.png',
  anestesia: '/products/anestesia.png',
  aftercare: '/products/aftercare.png',
  varios: '/products/varios.png',
  default: '/products/default.png',
}

export default function ProductArt({ category, className }: { category: string; className?: string }) {
  const src = IMAGES[category] ?? IMAGES.default
  return <img src={src} className={`product-art ${className ?? ''}`} alt="" aria-hidden="true" draggable={false} />
}
