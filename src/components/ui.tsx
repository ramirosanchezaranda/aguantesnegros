import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

/* ---------------------------------------------------------------- */
/* Botones                                                           */
/* ---------------------------------------------------------------- */

type BtnVariant = 'primary' | 'red' | 'ghost' | 'light'

export function Button({
  variant = 'primary',
  to,
  children,
  className = '',
  arrow,
  ...rest
}: {
  variant?: BtnVariant
  to?: string
  arrow?: boolean
  children: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `btn btn--${variant} ${className}`
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      {arrow && <ArrowIcon className="btn__arrow" />}
    </>
  )
  if (to) {
    const { onMouseEnter, onMouseLeave, onClick } = rest
    return (
      <Link to={to} className={cls} onMouseEnter={onMouseEnter as never} onMouseLeave={onMouseLeave as never} onClick={onClick as never}>
        {inner}
      </Link>
    )
  }
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  )
}

/* ---------------------------------------------------------------- */
/* Íconos lineales                                                   */
/* ---------------------------------------------------------------- */

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} className={className} {...iconProps} aria-hidden="true">
      <path d="M4 12 H20 M13 5 l7 7 -7 7" />
    </svg>
  )
}

export function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} className={className} {...iconProps} aria-hidden="true">
      <path d="M3 4 h2.5 l2.2 12.5 a1.5 1.5 0 0 0 1.5 1.2 h8.6 a1.5 1.5 0 0 0 1.5 -1.2 L21 8 H6" />
      <circle cx={10} cy={21} r={1.4} fill="currentColor" stroke="none" />
      <circle cx={17.5} cy={21} r={1.4} fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} className={className} {...iconProps} aria-hidden="true">
      <circle cx={10.5} cy={10.5} r={6.5} />
      <path d="M15.5 15.5 L21 21" />
    </svg>
  )
}

export function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} className={className} {...iconProps} aria-hidden="true">
      <circle cx={12} cy={8} r={4} />
      <path d="M4.5 20.5 a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}

export function MenuIcon({ open }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} {...iconProps} aria-hidden="true">
      {open ? <path d="M5 5 L19 19 M19 5 L5 19" /> : <path d="M3 6.5 H21 M3 12 H21 M3 17.5 H15" />}
    </svg>
  )
}

export function TruckIcon() {
  return (
    <svg viewBox="0 0 32 32" width={30} height={30} {...iconProps} aria-hidden="true">
      <rect x={2} y={8} width={17} height={13} rx={1.5} />
      <path d="M19 12 h5.5 l3.5 4.5 V21 h-3" />
      <circle cx={9} cy={24} r={2.5} stroke="#E53935" />
      <circle cx={23} cy={24} r={2.5} stroke="#E53935" />
      <path d="M5 12 h7 M5 15.5 h5" strokeWidth={1.6} />
    </svg>
  )
}

export function CardIcon() {
  return (
    <svg viewBox="0 0 32 32" width={30} height={30} {...iconProps} aria-hidden="true">
      <rect x={3} y={7} width={26} height={18} rx={2.5} />
      <path d="M3 13 H29" />
      <path d="M7 20 h6" stroke="#E53935" />
    </svg>
  )
}

export function BadgeIcon() {
  return (
    <svg viewBox="0 0 32 32" width={30} height={30} {...iconProps} aria-hidden="true">
      <path d="M16 3 l3 2.4 3.8 -.4 1.4 3.6 3.4 1.8 -.8 3.7 2.2 3.1 -2.2 3.1 .8 3.7 -3.4 1.8 -1.4 3.6 -3.8 -.4 -3 2.4 -3 -2.4 -3.8 .4 -1.4 -3.6 -3.4 -1.8 .8 -3.7 -2.2 -3.1 2.2 -3.1 -.8 -3.7 3.4 -1.8 1.4 -3.6 3.8 .4 Z" />
      <path d="M11.5 16.5 l3 3 6 -6.5" stroke="#E53935" />
    </svg>
  )
}

export function ChatIcon() {
  return (
    <svg viewBox="0 0 32 32" width={30} height={30} {...iconProps} aria-hidden="true">
      <path d="M4 6 h24 v16 h-14 l-6 5 v-5 h-4 Z" />
      <path d="M10 12 h12 M10 16 h8" stroke="#E53935" strokeWidth={1.6} />
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 32 32" width={30} height={30} {...iconProps} aria-hidden="true">
      <rect x={7} y={14} width={18} height={13} rx={2.5} />
      <path d="M11 14 V10 a5 5 0 0 1 10 0 v4" />
      <circle cx={16} cy={20.5} r={2} stroke="#E53935" />
    </svg>
  )
}

export function StarIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={15} height={15} aria-hidden="true">
      <path
        d="M10 1.7 l2.5 5.1 5.6 .8 -4 4 1 5.6 -5.1 -2.7 -5.1 2.7 1 -5.6 -4 -4 5.6 -.8 Z"
        fill={filled ? '#0B0B0B' : 'none'}
        stroke="#0B0B0B"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} {...iconProps} aria-hidden="true">
      <path d="M12 3 a9 9 0 0 0 -7.8 13.5 L3 21 l4.6 -1.2 A9 9 0 1 0 12 3 Z" />
      <path d="M8.8 8.5 c0 4 3 6.7 6.4 6.7 l1 -1.8 -2.2 -1.2 -1 1 c-1 -.5 -2 -1.5 -2.4 -2.5 l1 -.9 -1 -2.3 Z" strokeWidth={1.4} />
    </svg>
  )
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} {...iconProps} aria-hidden="true">
      <rect x={3.5} y={3.5} width={17} height={17} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17} cy={7} r={1.2} fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= rating} />
      ))}
    </span>
  )
}

/* ---------------------------------------------------------------- */
/* Reveal on scroll                                                  */
/* ---------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag ref={ref as never} className={`reveal ${shown ? 'reveal--in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

/* ---------------------------------------------------------------- */
/* Marquee                                                           */
/* ---------------------------------------------------------------- */

export function Marquee({ items, className = '' }: { items: string[]; className?: string }) {
  const row = items.map((t, i) => (
    <span className="marquee__item" key={i}>
      {t}
      <Spark4 />
    </span>
  ))
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee__track">
        {row}
        {row}
        {row}
      </div>
    </div>
  )
}

export function Spark4({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" width={12} height={12} className={className} aria-hidden="true">
      <path d="M8 0 L9.8 6.2 L16 8 L9.8 9.8 L8 16 L6.2 9.8 L0 8 L6.2 6.2 Z" fill="currentColor" />
    </svg>
  )
}

/* ---------------------------------------------------------------- */
/* Acordeón                                                          */
/* ---------------------------------------------------------------- */

export function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`accordion ${open ? 'accordion--open' : ''}`}>
      <button className="accordion__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{title}</span>
        <span className="accordion__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width={20} height={20} {...iconProps}>
            <path d="M4 12 H20" />
            <path d="M12 4 V20" className="accordion__vert" />
          </svg>
        </span>
      </button>
      <div className="accordion__body">
        <div className="accordion__inner">{children}</div>
      </div>
    </div>
  )
}
