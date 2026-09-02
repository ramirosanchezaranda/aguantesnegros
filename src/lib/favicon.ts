// Favicon de Guantín con el arte REAL del logo, en 3 expresiones que cambian
// según el estado de ánimo del mascot (que reacciona a las interacciones).
// Cada expresión tiene variante para pestañas claras (arte negro) y oscuras
// (arte con reborde blanco).

export type FaviconMood = 'happy' | 'surprised' | 'sad'

const FILES: Record<FaviconMood, { light: string; dark: string }> = {
  happy: { light: '/favicon/guantin-happy.png', dark: '/favicon/guantin-happy-dark.png' },
  surprised: { light: '/favicon/guantin-surprised.png', dark: '/favicon/guantin-surprised-dark.png' },
  sad: { light: '/favicon/guantin-sad.png', dark: '/favicon/guantin-sad-dark.png' },
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
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/png'
  link.href = FILES[mood][dark ? 'dark' : 'light']
}
