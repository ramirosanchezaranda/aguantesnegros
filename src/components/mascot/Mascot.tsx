import { useId, type ReactNode } from 'react'
import type { MascotVariant } from '../../data/catalog'

export const INK = '#0B0B0B'
export const RED = '#E53935'

/*
 * Mascota oficial "Guantín" — guante negro haciendo la V.
 * El personaje es un activo de marca fijo: cuerpo, cara, lentes y
 * proporciones son constantes. Las variantes solo cambian brazos,
 * piernas y el objeto que sostiene.
 *
 * Técnica sticker: cada grupo de formas se dibuja en 3 pasadas
 * (borde negro exterior → anillo blanco → relleno negro).
 */

function Sticker({ shape, outer = 26, ring = 13 }: { shape: ReactNode; outer?: number; ring?: number }) {
  return (
    <>
      <g fill={INK} stroke={INK} strokeWidth={outer} strokeLinejoin="round">{shape}</g>
      <g fill={INK} stroke="#fff" strokeWidth={ring} strokeLinejoin="round">{shape}</g>
      <g fill={INK}>{shape}</g>
    </>
  )
}

/** Trazo con outline sticker (para brazos y piernas). */
function Limb({ d, w = 12 }: { d: string; w?: number }) {
  const common = { d, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <>
      <path {...common} stroke={INK} strokeWidth={w + 18} />
      <path {...common} stroke="#fff" strokeWidth={w + 9} />
      <path {...common} stroke={INK} strokeWidth={w} />
    </>
  )
}

function Hand({ x, y, r = 23 }: { x: number; y: number; r?: number }) {
  return <Sticker outer={18} ring={10} shape={<circle cx={x} cy={y} r={r} />} />
}

/** Manito haciendo la V (la seña de la marca). */
function PeaceHand({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <Limb d={`M${x - 10} ${y} L${x - 22} ${y - 44}`} w={13} />
      <Limb d={`M${x + 10} ${y} L${x + 18} ${y - 46}`} w={13} />
      <Hand x={x} y={y} r={22} />
    </g>
  )
}

function RockHand({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <Limb d={`M${x - 12} ${y} L${x - 26} ${y - 42}`} w={12} />
      <Limb d={`M${x + 12} ${y} L${x + 26} ${y - 42}`} w={12} />
      <Hand x={x} y={y} r={21} />
    </g>
  )
}

function PointHand({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <Limb d={`M${x} ${y} L${x + 46} ${y - 10}`} w={14} />
      <Hand x={x} y={y} r={21} />
    </g>
  )
}

export function Spark({ x, y, s = 1, color = INK }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z"
      fill={color}
    />
  )
}

/** Rayitas de energía alrededor de la cabeza (como en el hero de referencia). */
export function EnergyRays({ color = RED }: { color?: string }) {
  const common = { stroke: color, strokeWidth: 10, strokeLinecap: 'round' as const, fill: 'none' }
  return (
    <g>
      <path {...common} d="M74 96 L48 62" />
      <path {...common} d="M54 160 L16 148" />
      <path {...common} d="M366 96 L392 62" />
      <path {...common} d="M386 160 L424 148" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Cuerpo base (INVARIABLE)                                            */
/* ------------------------------------------------------------------ */

function BodyShape() {
  return (
    <>
      <rect x={128} y={48} width={86} height={290} rx={43} transform="rotate(-9 171 193)" />
      <rect x={226} y={48} width={86} height={290} rx={43} transform="rotate(9 269 193)" />
      <ellipse cx={220} cy={372} rx={116} ry={104} />
    </>
  )
}

function KnuckleLines() {
  const common = { stroke: '#fff', strokeWidth: 8, strokeLinecap: 'round' as const, fill: 'none' }
  return (
    <g>
      <g transform="rotate(-9 171 193)">
        <path {...common} d="M148 96 q20 -16 40 -8" />
        <path {...common} d="M152 126 q18 -13 36 -6" />
      </g>
      <g transform="rotate(9 269 193)">
        <path {...common} d="M252 88 q20 -8 40 8" />
        <path {...common} d="M252 120 q18 -6 36 6" />
      </g>
    </g>
  )
}

function Cuff() {
  return <Sticker outer={20} ring={11} shape={<rect x={150} y={468} width={140} height={54} rx={24} />} />
}

export type Mood = 'happy' | 'excited' | 'sad' | 'peek' | 'alert'

/** Cara oficial: lentes blancos + sonrisa grande. Solo el "mood" ajusta la boca. */
export function Face({ mood = 'happy', clipId }: { mood?: Mood; clipId: string }) {
  const peek = mood === 'peek'
  return (
    <g>
      {/* ojos (solo visibles cuando espía por encima de los lentes) */}
      {peek && (
        <g>
          <circle cx={160} cy={314} r={17} fill="#fff" />
          <circle cx={280} cy={314} r={17} fill="#fff" />
          <circle cx={164} cy={316} r={7} fill={INK} />
          <circle cx={284} cy={316} r={7} fill={INK} />
        </g>
      )}
      {/* lentes */}
      <g
        style={{
          transform: peek ? 'translateY(34px) rotate(2deg)' : 'translateY(0) rotate(0deg)',
          transformOrigin: '220px 342px',
          transformBox: 'view-box',
          transition: 'transform .35s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        <clipPath id={`${clipId}-l`}>
          <rect x={118} y={314} width={82} height={56} rx={13} />
        </clipPath>
        <clipPath id={`${clipId}-r`}>
          <rect x={240} y={314} width={82} height={56} rx={13} />
        </clipPath>
        <rect x={198} y={326} width={44} height={13} rx={6} fill="#fff" />
        <rect x={90} y={324} width={28} height={13} rx={6} fill="#fff" />
        <rect x={322} y={324} width={28} height={13} rx={6} fill="#fff" />
        <rect x={112} y={308} width={94} height={68} rx={17} fill={INK} stroke="#fff" strokeWidth={11} />
        <rect x={234} y={308} width={94} height={68} rx={17} fill={INK} stroke="#fff" strokeWidth={11} />
        <g clipPath={`url(#${clipId}-l)`}>
          <path d="M128 388 L196 300" stroke="#fff" strokeWidth={14} />
          <path d="M154 392 L216 312" stroke="#fff" strokeWidth={6} />
        </g>
        <g clipPath={`url(#${clipId}-r)`}>
          <path d="M250 388 L318 300" stroke="#fff" strokeWidth={14} />
          <path d="M276 392 L338 312" stroke="#fff" strokeWidth={6} />
        </g>
      </g>
      {/* boca */}
      {mood === 'sad' ? (
        <path d="M172 446 Q220 414 268 446" stroke="#fff" strokeWidth={10} strokeLinecap="round" fill="none" />
      ) : mood === 'excited' ? (
        <g>
          <path
            d="M156 398 Q220 428 284 398 C294 452 262 494 220 494 C178 494 146 452 156 398 Z"
            fill={INK}
            stroke="#fff"
            strokeWidth={9}
            strokeLinejoin="round"
          />
          <rect x={192} y={414} width={25} height={34} rx={7} fill="#fff" />
          <rect x={223} y={414} width={25} height={34} rx={7} fill="#fff" />
          <path d="M196 478 Q220 490 244 478 L240 468 Q220 478 200 468 Z" fill={RED} />
        </g>
      ) : (
        <g>
          <path
            d="M152 402 Q220 438 288 402 C296 448 262 480 220 482 C178 480 144 448 152 402 Z"
            fill={INK}
            stroke="#fff"
            strokeWidth={9}
            strokeLinejoin="round"
          />
          <rect x={193} y={417} width={25} height={32} rx={7} fill="#fff" />
          <rect x={222} y={417} width={25} height={32} rx={7} fill="#fff" />
        </g>
      )}
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Objetos que sostiene (variantes oficiales)                          */
/* ------------------------------------------------------------------ */

function TattooMachine({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d="M0 40 q-30 40 -6 74 q14 20 40 14" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <Sticker
        outer={14}
        ring={8}
        shape={
          <>
            <rect x={-16} y={-34} width={32} height={64} rx={10} />
            <rect x={-30} y={-46} width={60} height={26} rx={9} />
          </>
        }
      />
      <path d="M0 30 L0 62" stroke={INK} strokeWidth={6} strokeLinecap="round" />
      <path d="M0 30 L0 58" stroke="#fff" strokeWidth={2} />
      <circle cx={0} cy={-33} r={6} fill="#fff" />
    </g>
  )
}

function InkBottle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Sticker
        outer={14}
        ring={8}
        shape={
          <>
            <rect x={-30} y={-40} width={60} height={104} rx={12} />
            <path d="M-16 -62 L16 -62 L28 -40 L-28 -40 Z" />
            <rect x={-12} y={-84} width={24} height={26} rx={5} />
          </>
        }
      />
      <rect x={-24} y={-8} width={48} height={34} rx={5} fill="#fff" />
      <text
        x={0}
        y={16}
        textAnchor="middle"
        fontFamily="'Clash Display', 'Arial Black', sans-serif"
        fontWeight={700}
        fontSize={22}
        fill={INK}
      >
        INK
      </text>
    </g>
  )
}

function CreamTube({ x, y, angle = -18 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <Sticker
        outer={14}
        ring={8}
        shape={
          <>
            <path d="M-26 -60 L26 -60 L32 44 Q0 58 -32 44 Z" />
            <rect x={-16} y={-82} width={32} height={24} rx={6} />
          </>
        }
      />
      <rect x={-22} y={-38} width={46} height={44} rx={6} fill="#fff" />
      <text x={1} y={-20} textAnchor="middle" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontWeight={700} fontSize={15} fill={INK}>
        TATTOO
      </text>
      <text x={1} y={-3} textAnchor="middle" fontFamily="'Clash Display', 'Arial Black', sans-serif" fontWeight={700} fontSize={15} fill={INK}>
        CREAM
      </text>
      <Spark x={14} y={22} s={0.6} color={RED} />
    </g>
  )
}

function PowerSupply({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Sticker outer={14} ring={8} shape={<rect x={-38} y={-34} width={76} height={68} rx={12} />} />
      <rect x={-26} y={-20} width={52} height={22} rx={4} fill="#fff" />
      <text x={0} y={-3} textAnchor="middle" fontFamily="'Clash Display', monospace" fontWeight={700} fontSize={16} fill={INK}>
        8.5v
      </text>
      <circle cx={-14} cy={16} r={7} fill="none" stroke="#fff" strokeWidth={4} />
      <circle cx={14} cy={16} r={7} fill="none" stroke="#fff" strokeWidth={4} />
    </g>
  )
}

function ShoppingCart({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Sticker
        outer={14}
        ring={8}
        shape={<path d="M-44 -34 L44 -34 L34 18 Q0 28 -34 18 Z" />}
      />
      <path d="M-44 -34 L-64 -52" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <circle cx={-24} cy={38} r={11} fill={INK} stroke="#fff" strokeWidth={5} />
      <circle cx={24} cy={38} r={11} fill={INK} stroke="#fff" strokeWidth={5} />
      <path d="M-30 -34 L-26 12 M0 -34 L0 14 M30 -34 L26 12" stroke="#fff" strokeWidth={4} />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Piernas y zapatillas                                                */
/* ------------------------------------------------------------------ */

function Sneaker({ cx, flip = false, lift = 0 }: { cx: number; flip?: boolean; lift?: number }) {
  return (
    <g transform={`translate(${cx} ${-lift}) ${flip ? 'scale(-1 1)' : ''}`}>
      <Sticker
        outer={16}
        ring={9}
        shape={
          <>
            <rect x={-38} y={538} width={80} height={30} rx={14} />
            <circle cx={-36} cy={556} r={17} />
          </>
        }
      />
      <path d="M-16 546 q10 8 22 4 M-22 555 q13 9 27 4" stroke="#fff" strokeWidth={6} strokeLinecap="round" fill="none" />
      <rect x={-56} y={562} width={102} height={16} rx={8} fill="#fff" stroke={INK} strokeWidth={5} />
    </g>
  )
}

function Legs({ pose = 'stand' }: { pose?: 'stand' | 'walk' }) {
  if (pose === 'walk') {
    return (
      <g>
        <Limb d="M196 516 L176 548" w={14} />
        <Limb d="M246 516 L272 540" w={14} />
        <Sneaker cx={168} flip lift={0} />
        <Sneaker cx={290} lift={22} />
        <path d="M118 574 q14 10 30 6 M112 588 q18 12 38 6" stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.55} />
      </g>
    )
  }
  return (
    <g>
      <Limb d="M194 516 L188 550" w={14} />
      <Limb d="M248 516 L254 550" w={14} />
      <Sneaker cx={182} flip />
      <Sneaker cx={262} />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Variantes de pose                                                   */
/* ------------------------------------------------------------------ */

function Pose({ variant }: { variant: MascotVariant }) {
  switch (variant) {
    case 'machine':
      return (
        <g>
          <Limb d="M112 392 C 66 380 48 330 58 282" />
          <Limb d="M330 396 C 368 392 382 418 356 438" />
          <TattooMachine x={54} y={230} angle={-8} />
          <Hand x={56} y={262} />
          <Hand x={352} y={436} r={21} />
        </g>
      )
    case 'ink':
      return (
        <g>
          <InkBottle x={70} y={470} />
          <Limb d="M118 400 C 84 408 74 424 72 398" />
          <Limb d="M330 396 C 368 392 382 418 356 438" />
          <Hand x={72} y={392} />
          <Hand x={352} y={436} r={21} />
        </g>
      )
    case 'cream':
      return (
        <g>
          <Limb d="M112 392 C 70 384 52 344 58 306" />
          <CreamTube x={56} y={252} />
          <Hand x={58} y={300} />
          <Limb d="M330 388 C 372 376 386 342 380 310" />
          <Hand x={380} y={306} />
          <Limb d="M380 306 L380 270" w={13} />
        </g>
      )
    case 'power':
      return (
        <g>
          <Limb d="M112 392 C 74 384 60 350 64 318" />
          <PowerSupply x={62} y={266} />
          <Hand x={64} y={312} />
          <Limb d="M330 396 C 368 392 382 418 356 438" />
          <Hand x={352} y={436} r={21} />
        </g>
      )
    case 'pointing':
      return (
        <g>
          <Limb d="M328 380 C 366 366 384 344 396 322" />
          <PointHand x={398} y={316} angle={-30} />
          <Limb d="M114 396 C 78 402 66 424 88 436" />
          <Hand x={90} y={434} r={21} />
        </g>
      )
    case 'walking':
      return (
        <g>
          <Limb d="M112 392 C 76 386 58 358 62 330" />
          <Hand x={62} y={324} />
          <Limb d="M330 392 C 366 398 380 424 360 442" />
          <Hand x={358} y={440} r={21} />
        </g>
      )
    case 'question':
      return (
        <g>
          <Limb d="M330 380 C 372 360 380 320 356 296" />
          <Hand x={352} y={292} />
          <Limb d="M114 396 C 78 402 66 424 88 436" />
          <Hand x={90} y={434} r={21} />
          <text
            x={396}
            y={210}
            textAnchor="middle"
            fontFamily="'Clash Display', 'Arial Black', sans-serif"
            fontWeight={700}
            fontSize={120}
            fill={RED}
            stroke="#fff"
            strokeWidth={3}
          >
            ?
          </text>
        </g>
      )
    case 'rock':
      return (
        <g>
          <Limb d="M112 386 C 66 372 48 326 56 284" />
          <RockHand x={54} y={276} angle={-14} />
          <Limb d="M330 386 C 376 372 392 326 386 284" />
          <RockHand x={386} y={276} angle={14} />
          <Spark x={30} y={190} s={1.1} />
          <Spark x={412} y={190} s={0.8} />
        </g>
      )
    case 'gloves':
      return (
        <g>
          <Limb d="M112 386 C 64 370 44 322 54 276" />
          <Hand x={54} y={268} r={26} />
          <Limb d="M330 396 C 368 392 382 418 356 438" />
          <Hand x={352} y={436} r={21} />
          <path d="M20 240 q-4 -18 10 -28 M32 262 q-16 -4 -22 -18" stroke={INK} strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.6} />
        </g>
      )
    case 'cart':
      return (
        <g>
          <Limb d="M328 384 C 372 376 396 388 410 404" />
          <Hand x={408} y={402} r={20} />
          <ShoppingCart x={452} y={470} />
          <Limb d="M114 396 C 78 402 66 424 88 436" />
          <Hand x={90} y={434} r={21} />
        </g>
      )
    case 'hero':
    default:
      return (
        <g>
          <Limb d="M112 386 C 62 372 42 320 52 270" />
          <PeaceHand x={52} y={262} angle={-12} />
          <Limb d="M330 396 C 372 390 388 416 358 438" />
          <Hand x={354} y={436} r={21} />
        </g>
      )
  }
}

export interface MascotProps {
  variant?: MascotVariant
  mood?: Mood
  className?: string
  flip?: boolean
  rays?: boolean
  title?: string
}

// Sprite sheet mapping: each variant maps to a sheet image and a cell position.
// Sheets are 3-column × 2-row grids.
// sheet-tools: (0,0)=machine (1,0)=ink (2,0)=cup+machine (0,1)=cream (1,1)=tattooing (2,1)=needle
// sheet-poses: (0,0)=peace (1,0)=looking-down (2,0)=arms-crossed (0,1)=walking (1,1)=rock-sparks (2,1)=pointing
type SpriteRef = { sheet: 'tools' | 'poses'; col: 0 | 1 | 2; row: 0 | 1 }
const SPRITE: Partial<Record<MascotVariant, SpriteRef>> = {
  machine:  { sheet: 'tools', col: 0, row: 0 },
  ink:      { sheet: 'tools', col: 1, row: 0 },
  cream:    { sheet: 'tools', col: 0, row: 1 },
  power:    { sheet: 'tools', col: 1, row: 1 },
  gloves:   { sheet: 'tools', col: 2, row: 1 },
  pointing: { sheet: 'poses', col: 2, row: 1 },
  walking:  { sheet: 'poses', col: 0, row: 1 },
  rock:     { sheet: 'poses', col: 1, row: 1 },
  question: { sheet: 'poses', col: 1, row: 0 },
  cart:     { sheet: 'poses', col: 0, row: 0 },
}

export function MascotImage({
  variant = 'hero',
  className,
  title,
}: {
  variant?: MascotVariant
  className?: string
  title?: string
}) {
  if (variant === 'hero') {
    return (
      <img
        src="/mascot/hero.png"
        alt={title ?? 'Guantín, la mascota de A Guantes Negros'}
        className={className}
        style={{ mixBlendMode: 'multiply' }}
        draggable={false}
      />
    )
  }
  const ref = SPRITE[variant]
  if (!ref) return null
  const xPct = ref.col === 0 ? '0%' : ref.col === 1 ? '50%' : '100%'
  const yPct = ref.row === 0 ? '0%' : '100%'
  return (
    <div
      role="img"
      aria-label={title ?? 'Guantín, la mascota de A Guantes Negros'}
      className={className}
      style={{
        backgroundImage: `url(/mascot/sheet-${ref.sheet}.png)`,
        backgroundSize: '300% 200%',
        backgroundPosition: `${xPct} ${yPct}`,
        backgroundRepeat: 'no-repeat',
        mixBlendMode: 'multiply',
      }}
    />
  )
}

export default function Mascot({ variant = 'hero', mood = 'happy', className, flip, rays, title }: MascotProps) {
  const id = useId()
  const clipId = `mascot-${id}`
  const wide = variant === 'cart'
  return (
    <svg
      viewBox={wide ? '0 0 520 600' : '0 0 440 600'}
      className={className}
      role="img"
      aria-label={title ?? 'Guantín, la mascota de A Guantes Negros'}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      {rays && <EnergyRays />}
      <Legs pose={variant === 'walking' ? 'walk' : 'stand'} />
      <Pose variant={variant} />
      <Cuff />
      <Sticker shape={<BodyShape />} />
      <KnuckleLines />
      <Face mood={mood} clipId={clipId} />
    </svg>
  )
}
