// Favicon de Guantín. El estado en reposo usa el ARTE REAL del logo
// (PNG, recortado a los dedos + cara para que lea a tamaño de pestaña),
// con variante para pestañas claras (arte negro) y oscuras (con reborde
// blanco). Reacciona a las interacciones cambiando de expresión.

export type FaviconMood = 'happy' | 'surprised' | 'sad'

// Arte real del logo (generado desde public/mascot/hero.png)
const REAL_LIGHT = '/favicon/guantin-32.png'
const REAL_DARK = '/favicon/guantin-32-dark.png'

// Expresiones reactivas (breves). No hay arte raster de estas caras, así que
// se dibujan en SVG con el mismo encuadre (dedos + lentes + boca).
function svg(mouth: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 510">
    <g fill="#0B0B0B" stroke="#fff" stroke-width="14" stroke-linejoin="round">
      <rect x="128" y="48" width="86" height="290" rx="43" transform="rotate(-9 171 193)"/>
      <rect x="226" y="48" width="86" height="290" rx="43" transform="rotate(9 269 193)"/>
      <ellipse cx="220" cy="372" rx="116" ry="104"/>
    </g>
    <rect x="198" y="326" width="44" height="13" rx="6" fill="#fff"/>
    <rect x="112" y="308" width="94" height="68" rx="17" fill="#0B0B0B" stroke="#fff" stroke-width="11"/>
    <rect x="234" y="308" width="94" height="68" rx="17" fill="#0B0B0B" stroke="#fff" stroke-width="11"/>
    ${mouth}
  </svg>`
}

const SURPRISED = `<ellipse cx="220" cy="432" rx="33" ry="42" fill="#0B0B0B" stroke="#fff" stroke-width="9"/>`
const SAD = `<path d="M170 458 Q220 410 270 458" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/>`

interface Icon {
  href: string
  type: string
}

function icon(mood: FaviconMood, dark: boolean): Icon {
  if (mood === 'surprised') return { href: 'data:image/svg+xml,' + encodeURIComponent(svg(SURPRISED)), type: 'image/svg+xml' }
  if (mood === 'sad') return { href: 'data:image/svg+xml,' + encodeURIComponent(svg(SAD)), type: 'image/svg+xml' }
  return { href: dark ? REAL_DARK : REAL_LIGHT, type: 'image/png' }
}

/** Traduce el estado de ánimo del mascot a una de las 3 caras del favicon. */
export function moodToFavicon(mood: string): FaviconMood {
  switch (mood) {
    case 'sad':
      return 'sad'
    case 'excited':
    case 'alert':
      return 'surprised'
    default:
      return 'happy'
  }
}

let currentKey = ''

export function applyFavicon(mood: FaviconMood, dark: boolean): void {
  const key = `${mood}-${dark ? 'd' : 'l'}`
  if (key === currentKey) return
  currentKey = key
  const { href, type } = icon(mood, dark)
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = type
  link.href = href
}
