import type { ArtKind } from '../data/catalog'

// Imagen del producto. Si tiene una foto cargada desde el panel se usa ésa;
// si no, se cae a la ilustración de la marca, elegida por el tipo de artículo
// (`art`) y, en su defecto, por la categoría — así productos distintos dentro
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
  product: { art: ArtKind; category: string; imageUrl?: string }
  className?: string
}) {
  const photo = product.imageUrl?.trim()
  const src = photo || BY_ART[product.art] || BY_CATEGORY[product.category] || FALLBACK
  return (
    <img
      src={src}
      // Las fotos ocupan más que las ilustraciones, que llevan aire por diseño.
      className={`product-art ${photo ? 'product-art--photo' : ''} ${className ?? ''}`}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
    />
  )
}
