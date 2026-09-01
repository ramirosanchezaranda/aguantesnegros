// Datos del negocio en un solo lugar: contacto, formas de envío y de pago.
// Antes el WhatsApp y el mail estaban repetidos en varios archivos.

export const WHATSAPP_NUMBER = '5491136962811'
export const WHATSAPP_DISPLAY = '+54 9 11 3696-2811'
export const CONTACT_EMAIL = 'aguantesnegros.info@gmail.com'

/** Link de WhatsApp, con mensaje opcional ya escrito. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

// ---- Envíos ---------------------------------------------------------------
// Precios FIJOS por método. Las tarifas reales de OCA y Correo Argentino
// dependen del código postal y del peso: para cobrarlas exactas hay que
// integrar una API de logística. Estos valores son los que cobra la tienda.

export interface ShippingMethod {
  id: string
  label: string
  detail: string
  price: number
  /** Si es false, no se piden calle ni código postal. */
  needsAddress: boolean
}

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'punto-encuentro',
    label: 'Coordinar punto de encuentro',
    detail: 'Arreglamos por WhatsApp dónde y cuándo. Sin costo.',
    price: 0,
    needsAddress: false,
  },
  {
    id: 'oca-sucursal',
    label: 'Entrega en Sucursal OCA',
    detail: 'Retirás en la sucursal más cercana.',
    price: 5012,
    needsAddress: false,
  },
  {
    id: 'correo-sucursal',
    label: 'Correo Argentino en Sucursal',
    detail: 'Retirás en la sucursal más cercana.',
    price: 5487,
    needsAddress: false,
  },
  {
    id: 'oca-domicilio',
    label: 'OCA a domicilio',
    detail: 'Te lo llevan a tu dirección.',
    price: 6683,
    needsAddress: true,
  },
  {
    id: 'correo-domicilio',
    label: 'Correo Argentino a domicilio',
    detail: 'Te lo llevan a tu dirección.',
    price: 8829,
    needsAddress: true,
  },
]

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id)
}

/** Las 24 jurisdicciones. Se pide siempre: hace falta para cotizar el envío
 *  —incluso a sucursal— y es lo que permite ver de dónde compran. */
export const PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
] as const

// ---- Pagos ----------------------------------------------------------------
// Todos se cierran por WhatsApp: la tienda no cobra online todavía.

export interface PaymentMethod {
  id: string
  label: string
  detail: string
  /** Qué tiene que hacer la persona después de confirmar. */
  next: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'efectivo',
    label: 'Efectivo',
    detail: 'Pagás al recibir el pedido.',
    next: 'Coordinamos la entrega por WhatsApp y pagás en el momento.',
  },
  {
    id: 'transferencia',
    label: 'Transferencia',
    detail: 'Te pasamos los datos y nos mandás el comprobante.',
    next: 'Te enviamos el CBU por WhatsApp; mandanos el comprobante por ahí mismo.',
  },
  {
    id: 'tarjeta',
    label: 'Débito o crédito',
    detail: 'Con link de Mercado Pago.',
    next: 'Te mandamos un link de Mercado Pago por WhatsApp para pagar con tarjeta.',
  },
]

export function getPaymentMethod(id: string): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id)
}
