import type { ArtKind } from '../data/catalog'

const INK = '#0B0B0B'
const RED = '#E53935'

/**
 * Ilustraciones de producto en línea, estilo marca:
 * trazo negro minimalista con un detalle rojo.
 */
export default function ProductArt({ kind, className }: { kind: ArtKind; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <Art kind={kind} />
    </svg>
  )
}

function Art({ kind }: { kind: ArtKind }) {
  const s = { fill: 'none', stroke: INK, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (kind) {
    case 'pen':
      return (
        <g>
          <rect x={86} y={28} width={28} height={110} rx={13} {...s} />
          <path d="M90 138 L96 158 L104 158 L110 138" {...s} />
          <path d="M100 158 L100 172" {...s} stroke={RED} />
          <rect x={80} y={44} width={40} height={14} rx={6} {...s} />
          <path d="M93 90 h14 M93 102 h14" {...s} strokeWidth={4} />
        </g>
      )
    case 'rotary':
      return (
        <g>
          <rect x={58} y={54} width={56} height={54} rx={14} {...s} />
          <circle cx={128} cy={81} r={20} {...s} />
          <circle cx={128} cy={81} r={6} fill={RED} stroke="none" />
          <path d="M86 108 L86 148 L80 166 L92 166 L98 148 L98 112" {...s} />
          <path d="M58 76 L38 76 Q30 76 30 86" {...s} />
        </g>
      )
    case 'cartridge':
      return (
        <g>
          <rect x={40} y={56} width={120} height={88} rx={10} {...s} />
          <path d="M40 84 H160" {...s} strokeWidth={4} />
          <path d="M64 100 L64 130 M88 100 L88 130 M112 100 L112 130 M136 100 L136 130" {...s} strokeWidth={4} />
          <path d="M52 70 h34" {...s} stroke={RED} strokeWidth={6} />
        </g>
      )
    case 'ink':
      return (
        <g>
          <rect x={72} y={70} width={56} height={94} rx={10} {...s} />
          <path d="M82 48 h36 l10 22 h-56 Z" {...s} />
          <rect x={88} y={30} width={24} height={18} rx={4} {...s} />
          <rect x={80} y={100} width={40} height={34} rx={4} {...s} strokeWidth={4} />
          <path d="M100 40 q14 -18 0 0" stroke={RED} strokeWidth={5} fill="none" />
          <circle cx={148} cy={52} r={5} fill={RED} stroke="none" />
        </g>
      )
    case 'power':
      return (
        <g>
          <rect x={48} y={58} width={104} height={84} rx={14} {...s} />
          <rect x={62} y={74} width={76} height={26} rx={5} {...s} strokeWidth={4} />
          <circle cx={76} cy={122} r={8} {...s} strokeWidth={4} />
          <circle cx={124} cy={122} r={8} {...s} strokeWidth={4} />
          <path d="M100 80 l-6 10 h12 l-6 10" stroke={RED} strokeWidth={4} fill="none" strokeLinejoin="round" />
        </g>
      )
    case 'grip':
      return (
        <g>
          <rect x={84} y={36} width={32} height={128} rx={16} {...s} />
          <path d="M88 70 h24 M88 84 h24 M88 98 h24 M88 112 h24" {...s} strokeWidth={4} />
          <path d="M84 140 h32" {...s} stroke={RED} strokeWidth={5} />
        </g>
      )
    case 'gloves':
      return (
        <g>
          <path d="M74 158 V96 Q74 60 96 60 Q104 60 106 72 L106 92 L118 58 Q124 46 132 52 Q140 58 134 70 L124 96 L138 84 Q148 76 152 86 Q156 94 146 102 L124 122 V158 Z" {...s} />
          <path d="M74 140 h50" {...s} strokeWidth={4} />
          <circle cx={58} cy={54} r={5} fill={RED} stroke="none" />
        </g>
      )
    case 'cream':
      return (
        <g>
          <path d="M76 64 h48 l6 92 q-30 14 -60 0 Z" {...s} />
          <rect x={88} y={40} width={24} height={22} rx={5} {...s} />
          <rect x={84} y={92} width={32} height={38} rx={5} {...s} strokeWidth={4} />
          <path d="M140 76 l4 8 8 2 -8 3 -4 8 -3 -8 -8 -3 8 -2 Z" fill={RED} stroke="none" />
        </g>
      )
    case 'kit':
      return (
        <g>
          <rect x={38} y={70} width={124} height={82} rx={12} {...s} />
          <path d="M80 70 V56 Q80 48 90 48 h20 Q120 48 120 56 V70" {...s} />
          <path d="M38 104 H162" {...s} strokeWidth={4} />
          <rect x={88} y={96} width={24} height={16} rx={4} {...s} strokeWidth={4} stroke={RED} />
        </g>
      )
    case 'pedal':
      return (
        <g>
          <ellipse cx={100} cy={120} rx={56} ry={30} {...s} />
          <ellipse cx={100} cy={108} rx={56} ry={30} {...s} />
          <path d="M100 78 q0 -30 30 -30" {...s} />
          <circle cx={134} cy={48} r={5} fill={RED} stroke="none" />
        </g>
      )
    case 'film':
      return (
        <g>
          <rect x={54} y={44} width={44} height={112} rx={22} {...s} />
          <path d="M98 56 L150 64 V152 L98 144" {...s} />
          <path d="M150 90 L120 96" {...s} strokeWidth={4} stroke={RED} />
        </g>
      )
    case 'soap':
      return (
        <g>
          <rect x={74} y={78} width={52} height={86} rx={10} {...s} />
          <rect x={86} y={54} width={28} height={24} rx={5} {...s} />
          <path d="M92 54 v-14 h24" {...s} />
          <circle cx={140} cy={54} r={6} {...s} strokeWidth={4} />
          <circle cx={152} cy={38} r={4} {...s} strokeWidth={4} stroke={RED} />
        </g>
      )
    case 'stencil':
      return (
        <g>
          <rect x={62} y={44} width={76} height={112} rx={10} {...s} />
          <path d="M84 78 q16 -14 32 0 q-16 20 -32 0 Z" {...s} strokeWidth={4} />
          <path d="M80 112 h40 M80 126 h28" {...s} strokeWidth={4} />
          <path d="M124 122 l4 8 8 2 -8 3 -4 8 -3 -8 -8 -3 8 -2 Z" fill={RED} stroke="none" />
        </g>
      )
  }
}
