import { useEffect } from 'react'
import { useMascotMood } from '../context/MascotMoodContext'
import { applyFavicon, moodToFavicon } from '../lib/favicon'

/** Sincroniza el favicon del navegador con el estado de ánimo del mascot. */
export default function FaviconController() {
  const { mood } = useMascotMood()
  useEffect(() => {
    applyFavicon(moodToFavicon(mood))
  }, [mood])
  return null
}
