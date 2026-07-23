import { useTheme } from '../../context/ThemeContext'

// Logo de Guantín (arte real) consciente del tema: arte negro sobre fondos
// claros, arte con reborde blanco sobre fondos oscuros. Se elige la expresión
// con la prop `face`.
type Face = 'happy' | 'surprised' | 'sad'

const SRC: Record<Face, { light: string; dark: string }> = {
  happy: { light: '/mascot/logo-happy-light.png', dark: '/mascot/logo-happy.png' },
  surprised: { light: '/mascot/logo-surprised-light.png', dark: '/mascot/logo-surprised.png' },
  sad: { light: '/mascot/logo-sad-light.png', dark: '/mascot/logo-sad.png' },
}

export default function Guantin({
  face = 'happy',
  className,
  title = 'Guantín, el logo de A Guantes Negros',
}: {
  face?: Face
  className?: string
  title?: string
}) {
  const { theme } = useTheme()
  return (
    <img
      src={SRC[face][theme === 'dark' ? 'dark' : 'light']}
      className={className}
      alt={title}
      draggable={false}
    />
  )
}
