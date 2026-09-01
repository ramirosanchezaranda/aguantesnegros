import type { ArtKind } from '../data/catalog'

// Imagen del producto. Si tiene fotos cargadas desde el panel se usa una de
// ellas (`index` elige cuál, para la galería de la ficha);
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
  index = 0,
}: {
  product: { art: ArtKind; category: string; images?: string[] }
  className?: string
  /** Cuál de las fotos mostrar. Si no existe, cae a la primera. */
  index?: number
}) {
  const gallery = product.images ?? []
  const photo = (gallery[index] ?? gallery[0])?.trim()
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
