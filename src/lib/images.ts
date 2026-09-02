// Preparación de imágenes de producto en el navegador: valida el formato,
// redimensiona y comprime antes de subir. Sin esto, una foto de celular de
// 5 MB viajaría entera a Storage (o reventaría la cuota de localStorage en
// modo demo).

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Tamaño máximo del archivo original que aceptamos leer. */
const MAX_INPUT_BYTES = 12 * 1024 * 1024

export interface CompressOptions {
  /** Lado mayor de la imagen resultante, en píxeles. */
  maxSide?: number
  quality?: number
}

export function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)
}

/**
 * Redimensiona a `maxSide` (sin agrandar) y codifica en WebP, que conserva la
 * transparencia de los PNG y pesa bastante menos que JPEG a igual calidad.
 */
export async function compressImage(file: File, { maxSide = 900, quality = 0.85 }: CompressOptions = {}): Promise<Blob> {
  if (!isAcceptedImage(file)) {
    throw new Error('Formato no admitido. Usá JPG, PNG o WebP.')
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('La imagen supera los 12 MB. Probá con una más liviana.')
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('No se pudo leer la imagen. ¿Está dañada?')
  })

  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('El navegador no pudo procesar la imagen.')
    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    if (!blob) throw new Error('No se pudo comprimir la imagen.')
    return blob
  } finally {
    bitmap.close()
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    reader.readAsDataURL(blob)
  })
}
