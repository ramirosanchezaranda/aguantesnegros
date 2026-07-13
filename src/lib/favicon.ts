// Favicon dinámico de Guantín: cambia de expresión según el estado de ánimo
// del mascot (que a su vez reacciona a las interacciones del usuario).
// Se dibuja en SVG (negro relleno + contorno blanco) para que lea nítido a
// 16px y funcione tanto en pestañas claras como oscuras.

export type FaviconMood = 'happy' | 'surprised' | 'sad'

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

const MOUTHS: Record<FaviconMood, string> = {
  // Sonrisa abierta con dientes
  happy: `<path d="M152 402 Q220 438 288 402 C296 448 262 480 220 482 C178 480 144 448 152 402 Z" fill="#0B0B0B" stroke="#fff" stroke-width="9" stroke-linejoin="round"/>
    <rect x="193" y="417" width="25" height="32" rx="7" fill="#fff"/>
    <rect x="222" y="417" width="25" height="32" rx="7" fill="#fff"/>`,
  // Boca en "O" (asombro)
  surprised: `<ellipse cx="220" cy="432" rx="33" ry="42" fill="#0B0B0B" stroke="#fff" stroke-width="9"/>`,
  // Boca hacia abajo (tristeza)
  sad: `<path d="M170 458 Q220 410 270 458" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round"/>`,
}

export function faviconDataUri(mood: FaviconMood): string {
  return 'data:image/svg+xml,' + encodeURIComponent(svg(MOUTHS[mood]))
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

let current: FaviconMood | null = null

export function applyFavicon(mood: FaviconMood): void {
  if (mood === current) return
  current = mood
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/svg+xml'
  link.href = faviconDataUri(mood)
}
