import { useEffect } from 'react'
import { useMascotMood } from '../context/MascotMoodContext'
import { useTheme } from '../context/ThemeContext'
import { applyFavicon, moodToFavicon } from '../lib/favicon'

/** Sincroniza el favicon con el estado de ánimo del mascot y el tema activo. */
export default function FaviconController() {
  const { mood } = useMascotMood()
  const { theme } = useTheme()
  useEffect(() => {
    applyFavicon(moodToFavicon(mood), theme === 'dark')
  }, [mood, theme])
  return null
}
