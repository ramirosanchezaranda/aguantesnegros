import { MascotImage, type MascotProps } from './Mascot'

/**
 * Logo de marca. Usa el PNG real de Guantín en ambos temas.
 * En modo oscuro, el CSS le agrega un reborde blanco (drop-shadow apilado
 * sobre el canal alfa) para que la silueta negra se despegue del fondo.
 */
export default function BrandMascot({ variant = 'hero', className = '', title }: MascotProps) {
  return <MascotImage variant={variant} className={`brand-mascot__png ${className}`} title={title} />
}
