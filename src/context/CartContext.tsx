import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getProduct, type Product } from '../data/catalog'
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

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
        setItems((prev) => {
          const found = prev.find((i) => i.slug === slug)
          if (found) return prev.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
          return [...prev, { slug, qty }]
        })
        pulse('excited')
      },
      setQty: (slug, qty) =>
        setItems((prev) =>
          qty <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, qty } : i)),
        ),
      remove: (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
      clear: () => {
        setItems([])
        setCoupon(null)
      },
    }
  }, [items, coupon, pulse])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useCart fuera de CartProvider')
  return v
}
