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
// La tienda no cotiza envíos: se coordinan por WhatsApp una vez hecho el
// pedido. Igual se pide la dirección completa, que es lo que permite cotizar
// y despachar sin tener que volver a preguntarla.

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

/** Link de WhatsApp hacia un cliente, a partir del número que él mismo cargó.
 *
 *  Devuelve `null` cuando no se puede normalizar con certeza: un wa.me armado
 *  a la fuerza abre un chat con un número equivocado, y eso es peor que
 *  mostrar el número como texto para copiarlo a mano.
 *
 *  Reglas: se saca el prefijo internacional, el 0 de larga distancia y el 15
 *  —que es la vieja marca de celular y wa.me no acepta—, y se exige que quede
 *  el formato argentino de 10 dígitos (código de área + abonado). */
export function customerWhatsappLink(raw: string, message?: string): string | null {
  let n = raw.replace(/\D/g, '')
  if (n.startsWith('00')) n = n.slice(2)
  if (n.startsWith('54')) n = n.slice(2)
  if (n.startsWith('9')) n = n.slice(1)
  if (n.startsWith('0')) n = n.slice(1)
  // El 15 va después del código de área, que mide 2, 3 o 4 dígitos. No se
  // puede deducir cuál es, así que se prueban las tres posiciones válidas.
  if (n.length === 12) {
    for (const cut of [2, 3, 4]) {
      if (n.slice(cut, cut + 2) === '15') {
        n = n.slice(0, cut) + n.slice(cut + 2)
        break
      }
    }
  }
  if (n.length !== 10) return null
  const base = `https://wa.me/549${n}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

// ---- Datos del responsable (Ley 25.326) -----------------------------------
// La ley de protección de datos personales pide que quien guarda los datos
// se identifique con nombre y domicilio. El mail y el WhatsApp ya alcanzan
// para que alguien ejerza sus derechos, así que la política funciona sin lo
// demás; completá estos dos y aparecen solos en /privacidad.

/** Razón social o nombre del titular del negocio. */
export const LEGAL_NAME = ''
/** CUIT o CUIL del responsable, si corresponde. */
export const LEGAL_TAX_ID = ''
/** Domicilio a los efectos legales. */
export const LEGAL_ADDRESS = ''

/** Última actualización de la política de privacidad (ISO, sin hora). */
export const PRIVACY_UPDATED = '2026-09-01'
