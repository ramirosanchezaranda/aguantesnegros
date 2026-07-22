import { useId } from 'react'
import { Face, INK, Spark, RED, type Mood } from './Mascot'

/**
 * Isologo reactivo: la cabeza oficial del guante (dedos en V + cara).
 * Cambia de expresión según lo que hace el usuario en la tienda:
 * espía al pasar el mouse, festeja al agregar al carrito, se pone
 * triste con el carrito vacío, etc.
 */
export default function LogoMark({ mood = 'happy', className }: { mood?: Mood; className?: string }) {
  const clipId = useId().replace(/[:]/g, '')
  return (
    <svg viewBox="0 0 440 510" className={className} aria-hidden="true" data-mood={mood}>
      <g className={`logomark-body logomark-body--${mood}`}>
        <g fill={INK} stroke={INK} strokeWidth={24} strokeLinejoin="round">
          <BodyHead />
        </g>
        <g fill={INK} stroke="#fff" strokeWidth={12} strokeLinejoin="round">
          <BodyHead />
        </g>
        <g fill={INK}>
          <BodyHead />
        </g>
        <g transform="rotate(-9 171 193)">
          <path d="M148 96 q20 -16 40 -8" stroke="#fff" strokeWidth={8} strokeLinecap="round" fill="none" />
        </g>
        <g transform="rotate(9 269 193)">
          <path d="M252 88 q20 -8 40 8" stroke="#fff" strokeWidth={8} strokeLinecap="round" fill="none" />
        </g>
        <Face mood={mood} clipId={clipId} />
      </g>
      {mood === 'excited' && (
        <g className="logomark-sparks">
          <Spark x={44} y={120} s={1.4} color={RED} />
          <Spark x={400} y={110} s={1} color={RED} />
          <Spark x={412} y={330} s={0.8} color={RED} />
        </g>
      )}
      {mood === 'sad' && (
        <path d="M330 262 q14 18 0 34 q-14 -16 0 -34" fill="#7FB2E5" stroke={INK} strokeWidth={5} />
      )}
    </svg>
  )
}

function BodyHead() {
  return (
    <>
      <rect x={128} y={48} width={86} height={290} rx={43} transform="rotate(-9 171 193)" />
      <rect x={226} y={48} width={86} height={290} rx={43} transform="rotate(9 269 193)" />
      <ellipse cx={220} cy={372} rx={116} ry={104} />
    </>
  )
}
