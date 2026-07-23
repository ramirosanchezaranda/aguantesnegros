import { useMascotMood } from '../../context/MascotMoodContext'
import { moodToFavicon } from '../../lib/favicon'

// Logo de marca reactivo: usa el arte real (versión con reborde blanco, para
// las barras oscuras del header/footer) y cambia de expresión según el estado
// de ánimo del mascot, igual que el favicon.
const SRC: Record<'happy' | 'surprised' | 'sad', string> = {
  happy: '/mascot/logo-happy.png',
  surprised: '/mascot/logo-surprised.png',
  sad: '/mascot/logo-sad.png',
}

export default function LogoMascot({ className }: { className?: string }) {
  const { mood } = useMascotMood()
  const expr = moodToFavicon(mood)
  return <img src={SRC[expr]} className={className} alt="A Guantes Negros" draggable={false} />
}
