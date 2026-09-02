// Registro de pedidos. Hasta ahora el checkout no guardaba nada: el número de
// pedido se inventaba en el navegador y se perdía. Sin esto no hay forma de
// calcular ninguna estadística de ventas.
//
// Igual que el catálogo, usa Supabase si está configurado y localStorage si no.

import { hasSupabase, restUrl, sbHeaders } from './supabase'

export interface OrderLine {
  slug: string
  name: string
  /** Precio unitario al momento de la compra: los precios cambian. */
  price: number
  /** Costo unitario al momento de la compra. Se congela acá porque el costo
   *  de reposición cambia y el margen histórico no debe moverse con él. */
  cost?: number
  qty: number
  category: string
}

/** Datos de contacto del comprador. Son datos personales: sólo los lee el
 *  admin, y hacen falta porque el pago y la entrega se cierran por WhatsApp. */
export interface Customer {
  name: string
  email: string
  whatsapp: string
}

export interface ShippingAddress {
  province: string
  city: string
  street: string
  zip: string
}

export interface Order {
  id: string
  /** ISO 8601. */
  createdAt: string
  items: OrderLine[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  coupon?: string
  customer?: Customer
  shippingMethod?: string
  paymentMethod?: string
  address?: ShippingAddress
}

const KEY = 'agn-orders-v1'

function readLocal(): Order[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as Order[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface OrderRow {
  id: string
  created_at: string
  items: OrderLine[] | null
  subtotal: number
  discount: number
  shipping: number
  total: number
  coupon: string | null
  customer: Customer | null
  shipping_method: string | null
  payment_method: string | null
  address: ShippingAddress | null
}

function rowToOrder(r: OrderRow): Order {
  return {
    id: r.id,
    createdAt: r.created_at,
    items: r.items ?? [],
    subtotal: r.subtotal,
    discount: r.discount,
    shipping: r.shipping,
    total: r.total,
    coupon: r.coupon ?? undefined,
    customer: r.customer ?? undefined,
    shippingMethod: r.shipping_method ?? undefined,
    paymentMethod: r.payment_method ?? undefined,
    address: r.address ?? undefined,
  }
}

export async function saveOrder(order: Order): Promise<void> {
  if (!hasSupabase()) {
    const all = readLocal()
    all.push(order)
    try {
      localStorage.setItem(KEY, JSON.stringify(all))
    } catch {
      /* sin espacio: no bloqueamos la compra por no poder registrarla */
    }
    return
  }
  const res = await fetch(restUrl('orders'), {
    method: 'POST',
    headers: await sbHeaders(),
    body: JSON.stringify({
      id: order.id,
      created_at: order.createdAt,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      total: order.total,
      coupon: order.coupon ?? null,
      customer: order.customer ?? null,
      shipping_method: order.shippingMethod ?? null,
      payment_method: order.paymentMethod ?? null,
      address: order.address ?? null,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`No se pudo registrar el pedido (${res.status}): ${body || res.statusText}`)
  }
}

/** Pedidos, del más reciente al más viejo. Sólo lo puede leer el admin. */
export async function listOrders(): Promise<Order[]> {
  if (!hasSupabase()) {
    return readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  const res = await fetch(restUrl('orders?select=*&order=created_at.desc'), { headers: await sbHeaders() })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`No se pudieron leer los pedidos (${res.status}): ${body || res.statusText}`)
  }
  return ((await res.json()) as OrderRow[]).map(rowToOrder)
}
