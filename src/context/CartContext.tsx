import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { stockOf, type Product } from '../data/catalog'
import { useCatalog } from './CatalogContext'
import { trackCart } from '../lib/carts'
import { useMascotMood } from './MascotMoodContext'

export const FREE_SHIPPING_THRESHOLD = 50000
export const SHIPPING_COST = 6990

const COUPONS: Record<string, number> = {
  GUANTIN10: 0.1,
}

export interface CartItem {
  slug: string
  qty: number
}

interface CartValue {
  items: CartItem[]
  count: number
  total: number
  discount: number
  shipping: number
  grandTotal: number
  coupon: string | null
  applyCoupon: (code: string) => boolean
  removeCoupon: () => void
  add: (slug: string, qty?: number) => void
  setQty: (slug: string, qty: number) => void
  remove: (slug: string) => void
  clear: () => void
  entries: { product: Product; qty: number }[]
}

const Ctx = createContext<CartValue | null>(null)
const STORAGE_KEY = 'agn-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  })
  const [coupon, setCoupon] = useState<string | null>(null)
  const { pulse } = useMascotMood()
  const { getProduct } = useCatalog()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Registro anónimo del carrito para medir abandono. Con retardo: si no,
  // tocar "+" cinco veces escribiría cinco veces. Sólo cuenta productos y
  // cantidades, nunca datos de la persona.
  useEffect(() => {
    if (items.length === 0) return
    const timer = setTimeout(() => {
      const lines = items
        .map((i) => ({ product: getProduct(i.slug), qty: i.qty }))
        .filter((e): e is { product: Product; qty: number } => Boolean(e.product))
      if (lines.length === 0) return
      void trackCart(
        lines.map(({ product, qty }) => ({ slug: product.slug, name: product.name, qty })),
        lines.reduce((sum, e) => sum + e.product.price * e.qty, 0),
      )
    }, 2000)
    return () => clearTimeout(timer)
  }, [items, getProduct])

  const value = useMemo<CartValue>(() => {
    const entries = items
      .map((i) => ({ product: getProduct(i.slug)!, qty: i.qty }))
      .filter((e) => e.product)
    const total = entries.reduce((sum, e) => sum + e.product.price * e.qty, 0)
    const count = entries.reduce((sum, e) => sum + e.qty, 0)
    const rate = coupon ? (COUPONS[coupon] ?? 0) : 0
    const discount = Math.round(total * rate)
    const afterDiscount = total - discount
    const shipping = afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
    const grandTotal = afterDiscount + shipping
    return {
      items,
      entries,
      count,
      total,
      discount,
      shipping,
      grandTotal,
      coupon,
      applyCoupon: (code: string) => {
        const key = code.trim().toUpperCase()
        if (COUPONS[key]) {
          setCoupon(key)
          return true
        }
        return false
      },
      removeCoupon: () => setCoupon(null),
      add: (slug, qty = 1) => {
        const prod = getProduct(slug)
        const max = prod ? stockOf(prod) : Infinity
        if (max <= 0) return
        setItems((prev) => {
          const found = prev.find((i) => i.slug === slug)
          const nextQty = Math.min((found?.qty ?? 0) + qty, max)
          if (found) return prev.map((i) => (i.slug === slug ? { ...i, qty: nextQty } : i))
          return [...prev, { slug, qty: nextQty }]
        })
        pulse('excited')
      },
      setQty: (slug, qty) => {
        const prod = getProduct(slug)
        const max = prod ? stockOf(prod) : Infinity
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.slug !== slug)
            : prev.map((i) => (i.slug === slug ? { ...i, qty: Math.min(qty, max) } : i)),
        )
      },
      remove: (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
      clear: () => {
        setItems([])
        setCoupon(null)
      },
    }
  }, [items, coupon, pulse, getProduct])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCart fuera de CartProvider')
  return v
}
