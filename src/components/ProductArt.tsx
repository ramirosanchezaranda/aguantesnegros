import type { ArtKind } from '../data/catalog'

// Ilustración real del producto. Se elige por el tipo de artículo (`art`) y,
// si no hay una específica, por la categoría — así productos distintos dentro
// de una misma categoría (agujas y cartuchos) conservan su propia imagen.
//
// Se usan rutas literales (no un template `/products/${x}.png`) para que el
// bundler las resuelva estáticamente y puedan inlinearse en la preview.

const BY_ART: Partial<Record<ArtKind, string>> = {
  gloves: '/products/descartables.png',
  film: '/products/descartables.png',
  needle: '/products/agujas.png',
  cartridge: '/products/cartuchos.png',
  grip: '/products/punteras.png',
  ink: '/products/pigmentos.png',
  cream: '/products/anestesia.png',
  soap: '/products/aftercare.png',
  stencil: '/products/varios.png',
  kit: '/products/varios.png',
}

const BY_CATEGORY: Record<string, string> = {
  pigmentos: '/products/pigmentos.png',
  bioseguridad: '/products/descartables.png',
  agujas: '/products/agujas.png',
  varios: '/products/varios.png',
}

const FALLBACK = '/products/default.png'

export default function ProductArt({
  product,
  className,
}: {
  product: { art: ArtKind; category: string }
  className?: string
}) {
  const src = BY_ART[product.art] ?? BY_CATEGORY[product.category] ?? FALLBACK
  return <img src={src} className={`product-art ${className ?? ''}`} alt="" aria-hidden="true" draggable={false} />
}
