import Mascot, { MascotImage, type MascotProps } from './Mascot'

/**
 * Logo de marca adaptable al tema: PNG real en claro, SVG contorno en oscuro.
 * Renderiza ambos; el CSS (html[data-theme]) muestra el que corresponde,
 * así el switch de tema es instantáneo y sin re-render.
 */
export default function BrandMascot({ variant = 'hero', className = '', title }: MascotProps) {
  return (
    <span className="brand-mascot">
      <MascotImage variant={variant} className={`brand-mascot__png ${className}`} title={title} />
      <Mascot variant={variant} className={`brand-mascot__svg ${className}`} title={title} />
    </span>
  )
}
