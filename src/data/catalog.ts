export type MascotVariant =
  | 'hero'
  | 'machine'
  | 'ink'
  | 'cream'
  | 'power'
  | 'pointing'
  | 'walking'
  | 'question'
  | 'rock'
  | 'gloves'
  | 'cart'

export type ArtKind =
  | 'pen'
  | 'rotary'
  | 'cartridge'
  | 'needle'
  | 'ink'
  | 'power'
  | 'grip'
  | 'gloves'
  | 'cream'
  | 'kit'
  | 'pedal'
  | 'film'
  | 'soap'
  | 'stencil'

export interface Category {
  slug: string
  name: string
  tagline: string
  mascot: MascotVariant
  art: ArtKind
}

export interface Product {
  slug: string
  name: string
  brand: string
  price: number
  compareAt?: number
  category: string
  art: ArtKind
  rating: number
  reviews: number
  badge?: string
  featured?: boolean
  description: string
  specs: [string, string][]
  /** Unidades disponibles. Si falta (catálogo semilla), se asume DEFAULT_STOCK. */
  stock?: number
  /** Fotos reales del producto (hasta MAX_IMAGES). Si no hay, se usa la
   *  ilustración de la marca. */
  images?: string[]
  /** Colores disponibles, en hexadecimal (hasta MAX_COLORS). */
  colors?: string[]
  /** Precio de costo. Sin esto no se puede calcular el margen. */
  cost?: number
}

/** Stock por defecto para productos del catálogo semilla que no lo declaran. */
export const DEFAULT_STOCK = 20

/** Máximo de fotos por producto. */
export const MAX_IMAGES = 3

/** Máximo de colores por producto. */
export const MAX_COLORS = 5

/** Stock efectivo de un producto, tolerando el catálogo semilla sin `stock`. */
export function stockOf(product: Product): number {
  return product.stock ?? DEFAULT_STOCK
}

export const CATEGORIES: Category[] = [
  { slug: 'pigmentos', name: 'Pigmentos', tagline: 'Tintas Dynamic, Elephant Klug y Vincent', mascot: 'ink', art: 'ink' },
  {
    slug: 'bioseguridad',
    name: 'Productos de Bioseguridad',
    tagline: 'Barbijos, guantes, jabón, campos y film',
    mascot: 'gloves',
    art: 'gloves',
  },
  { slug: 'agujas', name: 'Agujas', tagline: 'Agujas y cartuchos, todas las configuraciones', mascot: 'pointing', art: 'cartridge' },
  { slug: 'varios', name: 'Varios', tagline: 'Stencil, cables y cuidado post tatuaje', mascot: 'hero', art: 'stencil' },
]

export const PRODUCTS: Product[] = [
  /* ---- PIGMENTOS ---- */

  {
    slug: 'dynamic-black-8oz',
    name: 'Dynamic Black 8 oz',
    brand: 'Dynamic',
    price: 18990,
    category: 'pigmentos',
    art: 'ink',
    rating: 5,
    reviews: 203,
    badge: 'CLÁSICA',
    featured: true,
    description:
      'El negro más legendario de la industria. Fluida para líneas, densa para relleno y con una curación que los negros de Dynamic garantizan por décadas. La botella que no puede faltar.',
    specs: [
      ['Contenido', '240 ml / 8 oz'],
      ['Color', 'Negro intenso'],
      ['Origen', 'USA'],
    ],
  },
  {
    slug: 'elephant-klug-1oz',
    name: 'Elephant Klug 1 oz',
    brand: 'Elephant Klug',
    price: 4990,
    category: 'pigmentos',
    art: 'ink',
    rating: 5,
    reviews: 88,
    description:
      'Pigmento Elephant Klug en frasco de 1 oz. Negro intenso, curación limpia y tonos bien sostenidos en el tiempo. Ideal para líneas y sombras.',
    specs: [
      ['Contenido', '30 ml / 1 oz'],
      ['Color', 'Negro'],
    ],
  },
  {
    slug: 'elephant-klug-4oz',
    name: 'Elephant Klug 4 oz',
    brand: 'Elephant Klug',
    price: 14990,
    category: 'pigmentos',
    art: 'ink',
    rating: 5,
    reviews: 61,
    description:
      'Pigmento Elephant Klug en frasco de 4 oz. Para estudios de alto volumen. Mismo negro profundo, más rendimiento.',
    specs: [
      ['Contenido', '120 ml / 4 oz'],
      ['Color', 'Negro'],
    ],
  },
  {
    slug: 'elephant-klug-8oz',
    name: 'Elephant Klug 8 oz',
    brand: 'Elephant Klug',
    price: 24990,
    category: 'pigmentos',
    art: 'ink',
    rating: 5,
    reviews: 44,
    badge: 'RENDIDOR',
    description:
      'Pigmento Elephant Klug 8 oz. El formato más económico por ml para estudios que trabajan en serio. Negro profundo, sesión tras sesión.',
    specs: [
      ['Contenido', '240 ml / 8 oz'],
      ['Color', 'Negro'],
    ],
  },
  {
    slug: 'vincent-black-1oz',
    name: 'Vincent Black 1 oz',
    brand: 'Vincent',
    price: 5490,
    category: 'pigmentos',
    art: 'ink',
    rating: 4,
    reviews: 53,
    description:
      'Pigmento Vincent Black 1 oz. Negro de alta concentración, viscosidad media y curación uniforme. Una alternativa premium con excelente relación precio-calidad.',
    specs: [
      ['Contenido', '30 ml / 1 oz'],
      ['Color', 'Negro'],
    ],
  },
  {
    slug: 'biomaser-cejas-12ml',
    name: 'Biomaser Cejas 12 ml',
    brand: 'Biomaser',
    price: 7990,
    category: 'pigmentos',
    art: 'ink',
    rating: 5,
    reviews: 39,
    badge: 'PMU',
    description:
      'Pigmento Biomaser específico para cejas en dermopigmentación. 12 ml de alta concentración, colores calibrados para piel latinoamericana y curación predecible.',
    specs: [
      ['Contenido', '12 ml'],
      ['Uso', 'Cejas (dermopigmentación)'],
      ['Origen', 'Biomaser'],
    ],
  },
  /* ---- PRODUCTOS DE BIOSEGURIDAD ---- */
  {
    slug: 'guantes-nitrilo-negros-x100',
    name: 'Guantes de Nitrilo Negros x100',
    brand: 'A Guantes Negros',
    price: 13990,
    category: 'bioseguridad',
    art: 'gloves',
    rating: 5,
    reviews: 218,
    badge: 'LA CASA',
    featured: true,
    description:
      'El producto que le da nombre a la casa. Nitrilo negro de alta resistencia, sin látex y con el calce exacto. Caja x100 unidades disponible en S, M, L y XL.',
    specs: [
      ['Material', 'Nitrilo'],
      ['Color', 'Negro'],
      ['Cantidad', 'Caja x100'],
      ['Talles', 'S / M / L / XL'],
      ['Libre de látex', 'Sí'],
    ],
  },
  {
    slug: 'film-eco-15m',
    name: 'Film Eco 15m',
    brand: 'A Guantes Negros',
    price: 4490,
    category: 'bioseguridad',
    art: 'film',
    rating: 4,
    reviews: 87,
    description:
      'Rollo de film protector de 15 metros para cubrir máquinas, camillas y superficies de trabajo. Higiene total, sesión tras sesión.',
    specs: [
      ['Largo', '15 m'],
      ['Ancho', '30 cm'],
    ],
  },
  {
    slug: 'cubre-cable-x100',
    name: 'Cubre Cable x100',
    brand: 'A Guantes Negros',
    price: 5990,
    category: 'bioseguridad',
    art: 'film',
    rating: 5,
    reviews: 64,
    description:
      'Fundas descartables para clip cord y cables RCA. Caja x100 unidades. Mantené tu estación impecable con cero esfuerzo.',
    specs: [
      ['Cantidad', 'Caja x100'],
      ['Material', 'Polietileno'],
      ['Compatibilidad', 'Clip cord y RCA'],
    ],
  },
  {
    slug: 'campos-esteriles-x50',
    name: 'Campos Estériles BN x50',
    brand: 'A Guantes Negros',
    price: 6990,
    category: 'bioseguridad',
    art: 'film',
    rating: 4,
    reviews: 29,
    description:
      'Campos estériles descartables para organizar y proteger tu espacio de trabajo. Paquete x50 unidades.',
    specs: [
      ['Cantidad', 'x50 unidades'],
      ['Esterilización', 'E.O. Gas'],
    ],
  },
  {
    slug: 'barbijos-descartables-x50',
    name: 'Barbijos Descartables x50',
    brand: 'A Guantes Negros',
    price: 3990,
    category: 'bioseguridad',
    art: 'film',
    rating: 4,
    reviews: 38,
    description:
      'Barbijos tricapa descartables para uso en estudio. Paquete x50. Comodidad y protección en cada sesión.',
    specs: [
      ['Cantidad', 'x50 unidades'],
      ['Capas', '3 capas'],
    ],
  },
  {
    slug: 'jabon-antiseptico',
    name: 'Jabón Antiséptico',
    brand: 'A Guantes Negros',
    price: 3990,
    category: 'bioseguridad',
    art: 'soap',
    rating: 5,
    reviews: 64,
    description:
      'Jabón antiséptico neutro para limpiar la zona durante y después del tatuaje. pH equilibrado, sin perfumes y sin irritación en piel recién tatuada.',
    specs: [
      ['Contenido', '500 ml'],
      ['pH', 'Neutro'],
      ['Perfume', 'Sin perfume'],
    ],
  },
  /* ---- AGUJAS ---- */

  {
    slug: 'agujas-1207-rl-x50',
    name: 'Agujas 1207 RL x50',
    brand: 'A Guantes Negros',
    price: 3490,
    category: 'agujas',
    art: 'needle',
    rating: 5,
    reviews: 134,
    badge: 'MÁS VENDIDAS',
    featured: true,
    description:
      'Agujas round liner 7 en blister x50 unidades. Ideales para líneas medianas con precisión constante. Afiladas con laser, esterilizadas con gas EO.',
    specs: [
      ['Configuración', '1207 RL'],
      ['Cantidad', 'Blister x50'],
      ['Esterilización', 'E.O. Gas'],
    ],
  },
  {
    slug: 'agujas-1205-rs-x50',
    name: 'Agujas 1205 RS x50',
    brand: 'A Guantes Negros',
    price: 3290,
    category: 'agujas',
    art: 'needle',
    rating: 5,
    reviews: 98,
    description:
      'Round shader 5 en blister x50. Para sombras suaves y trabajo en pequeños detalles. Flujo de tinta constante.',
    specs: [
      ['Configuración', '1205 RS'],
      ['Cantidad', 'Blister x50'],
      ['Esterilización', 'E.O. Gas'],
    ],
  },
  {
    slug: 'agujas-1209-rl-x50',
    name: 'Agujas 1209 RL x50',
    brand: 'A Guantes Negros',
    price: 3490,
    category: 'agujas',
    art: 'needle',
    rating: 5,
    reviews: 77,
    description:
      'Round liner 9 en blister x50. Para líneas más gruesas y relleno de detalles. Punta afilada, calidad consistente.',
    specs: [
      ['Configuración', '1209 RL'],
      ['Cantidad', 'Blister x50'],
    ],
  },
  {
    slug: 'agujas-1215-rl-x50',
    name: 'Agujas 1215 RL x50',
    brand: 'A Guantes Negros',
    price: 3790,
    category: 'agujas',
    art: 'needle',
    rating: 4,
    reviews: 45,
    description:
      'Round liner 15 en blister x50. Ideales para líneas gruesas y estilos neo-tradicional.',
    specs: [
      ['Configuración', '1215 RL'],
      ['Cantidad', 'Blister x50'],
    ],
  },
  {
    slug: 'agujas-1205-m1-x50',
    name: 'Agujas 1205 M1 x50',
    brand: 'A Guantes Negros',
    price: 3490,
    category: 'agujas',
    art: 'needle',
    rating: 4,
    reviews: 52,
    description:
      'Magnum 5 en blister x50. Para color sólido y sombras en áreas pequeñas. Distribución de tinta uniforme.',
    specs: [
      ['Configuración', '1205 M1'],
      ['Cantidad', 'Blister x50'],
    ],
  },

  {
    slug: 'cartuchos-black-sheep-1205rl-x20',
    name: 'Black Sheep 1205 RL x20',
    brand: 'Black Sheep',
    price: 9990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 176,
    badge: 'MÁS VENDIDO',
    featured: true,
    description:
      'Cartucho round liner 5 de Black Sheep en caja x20 unidades. Membrana antiretorno de precisión, flujo de tinta estable y aguja afilada con láser. Para líneas finas perfectas.',
    specs: [
      ['Configuración', '1205 RL'],
      ['Cantidad', 'Caja x20'],
      ['Membrana', 'Antiretorno'],
      ['Aguja', 'Afilada con láser'],
    ],
  },
  {
    slug: 'cartuchos-black-sheep-1209rl-x20',
    name: 'Black Sheep 1209 RL x20',
    brand: 'Black Sheep',
    price: 9990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 143,
    description:
      'Cartucho round liner 9 de Black Sheep, caja x20. Para líneas medianas y gruesas con la consistencia que exige el trabajo profesional.',
    specs: [
      ['Configuración', '1209 RL'],
      ['Cantidad', 'Caja x20'],
      ['Membrana', 'Antiretorno'],
    ],
  },
  {
    slug: 'cartuchos-black-sheep-1215m1-x20',
    name: 'Black Sheep 1215 M1 x20',
    brand: 'Black Sheep',
    price: 10990,
    category: 'agujas',
    art: 'cartridge',
    rating: 4,
    reviews: 67,
    description:
      'Cartucho magnum 15 de Black Sheep, caja x20. Para empaquetar color y sombras en áreas grandes. Distribución perfecta.',
    specs: [
      ['Configuración', '1215 M1'],
      ['Cantidad', 'Caja x20'],
    ],
  },
  {
    slug: 'cartuchos-filter-1205rl-x20',
    name: 'Filter 1205 RL x20',
    brand: 'Filter',
    price: 8990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 94,
    description:
      'Cartucho round liner 5 Filter, caja x20. Membrana de alta precisión y aguja tratada para líneas ultra finas. Muy popular en lettering y fineline.',
    specs: [
      ['Configuración', '1205 RL'],
      ['Cantidad', 'Caja x20'],
      ['Membrana', 'Alta precisión'],
    ],
  },
  {
    slug: 'cartuchos-filter-1207rl-x20',
    name: 'Filter 1207 RL x20',
    brand: 'Filter',
    price: 8990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 88,
    description:
      'Cartucho round liner 7 Filter, caja x20. Flujo constante, sin saltos ni tapones. Líneas claras y definidas.',
    specs: [
      ['Configuración', '1207 RL'],
      ['Cantidad', 'Caja x20'],
    ],
  },
  {
    slug: 'cartuchos-ez-1205rl-x20',
    name: 'EZ Revolution 1205 RL x20',
    brand: 'EZ Revolution',
    price: 11990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 72,
    badge: 'PRO',
    description:
      'Cartucho EZ Revolution round liner 5, caja x20. Tecnología de punta: aguja soldada a láser, membrana de doble cámara y ajuste perfecto en cualquier pen.',
    specs: [
      ['Configuración', '1205 RL'],
      ['Cantidad', 'Caja x20'],
      ['Membrana', 'Doble cámara'],
      ['Aguja', 'Soldada a láser'],
    ],
  },
  {
    slug: 'cartuchos-ez-1209rl-x20',
    name: 'EZ Revolution 1209 RL x20',
    brand: 'EZ Revolution',
    price: 11990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 61,
    description:
      'Cartucho EZ Revolution round liner 9, caja x20. Potencia y precisión para cualquier estilo. El preferido de artistas de nivel internacional.',
    specs: [
      ['Configuración', '1209 RL'],
      ['Cantidad', 'Caja x20'],
    ],
  },
  /* ---- VARIOS ---- */

  {
    slug: 'butter-tha-thu',
    name: 'Butter Tha Thu',
    brand: 'Butter Tha Thu',
    price: 7490,
    category: 'varios',
    art: 'cream',
    rating: 5,
    reviews: 118,
    featured: true,
    description:
      'Manteca de cacao natural para el cuidado post-tattoo. Hidratación profunda, recuperación acelerada y negros más intensos. Sin químicos, sin conservantes agresivos.',
    specs: [
      ['Base', 'Manteca de cacao'],
      ['Uso', 'Post sesión'],
      ['Conservantes', 'Sin parabenos'],
    ],
  },
  {
    slug: 'crema-post-tattoo',
    name: 'Crema Post Tattoo',
    brand: 'A Guantes Negros',
    price: 5990,
    category: 'varios',
    art: 'cream',
    rating: 4,
    reviews: 76,
    description:
      'Crema post-tattoo de la casa: base vegetal, caléndula y manteca de karité. Cicatrización acelerada, menos picazón y colores que se mantienen intensos.',
    specs: [
      ['Base', 'Vegetal'],
      ['Activos', 'Caléndula + Karité'],
      ['Uso', 'Post sesión'],
    ],
  },
  {
    slug: 'stencil-original-black',
    name: 'Stencil Original Black',
    brand: 'Stencil Original',
    price: 4990,
    category: 'varios',
    art: 'stencil',
    rating: 5,
    reviews: 89,
    description:
      'Papel de transferencia estencial negro. Transferencia nítida, rápido secado y excelente adherencia. Compatible con cualquier solución de stencil.',
    specs: [
      ['Color', 'Negro'],
      ['Hojas', 'x50'],
      ['Tipo', 'Carbon transfer'],
    ],
  },
  {
    slug: 'inkplay-stencil',
    name: 'Inkplay Stencil',
    brand: 'Inkplay',
    price: 5490,
    category: 'varios',
    art: 'stencil',
    rating: 5,
    reviews: 102,
    badge: 'FAVORITO',
    description:
      'Solución de stencil Inkplay. El producto que hace que el stencil aguante toda la sesión: agarre firme, líneas bien definidas y sin corridas.',
    specs: [
      ['Contenido', '120 ml'],
      ['Secado', '60 segundos'],
    ],
  },
  {
    slug: 'inkplay-foam',
    name: 'Inkplay Foam',
    brand: 'Inkplay',
    price: 4490,
    category: 'varios',
    art: 'soap',
    rating: 4,
    reviews: 58,
    description:
      'Espuma limpiadora Inkplay para usar durante la sesión. Neutra, sin fragancia y con activos calmantes para minimizar el estrés en la piel.',
    specs: [
      ['Contenido', '200 ml'],
      ['Tipo', 'Espuma'],
    ],
  },
  {
    slug: 'inkplay-finish-spray',
    name: 'Inkplay Finish Spray',
    brand: 'Inkplay',
    price: 4990,
    category: 'varios',
    art: 'soap',
    rating: 4,
    reviews: 43,
    description:
      'Spray de cierre Inkplay para aplicar al finalizar la sesión. Sella la zona, reduce la inflamación y prepara la piel para la cicatrización.',
    specs: [
      ['Contenido', '150 ml'],
      ['Aplicación', 'Al finalizar la sesión'],
    ],
  },
  {
    slug: 'inkplay-witch-hazel',
    name: 'Inkplay Witch Hazel',
    brand: 'Inkplay',
    price: 3990,
    category: 'varios',
    art: 'soap',
    rating: 5,
    reviews: 37,
    description:
      'Hamamelis puro Inkplay (Witch Hazel) para limpiar sin irritar. Refrescante, antiséptico y compatible con cualquier tipo de piel.',
    specs: [
      ['Contenido', '250 ml'],
      ['Base', 'Hamamelis puro'],
    ],
  },

  {
    slug: 'piel-sintetica-a4',
    name: 'Piel Sintética A4',
    brand: 'A Guantes Negros',
    price: 4990,
    category: 'varios',
    art: 'stencil',
    rating: 5,
    reviews: 93,
    badge: 'PRÁCTICA',
    description:
      'Piel sintética formato A4 para práctica de tattoo. Textura y firmeza similares a la piel real. Ideal para alumnos y para probar diseños antes de tatuar.',
    specs: [
      ['Tamaño', 'A4 (21 x 29.7 cm)'],
      ['Capas', 'Doble capa'],
      ['Grosor', '4 mm'],
    ],
  },
  {
    slug: 'cable-rca-clip-cord',
    name: 'Cable RCA / Clip Cord',
    brand: 'A Guantes Negros',
    price: 4490,
    category: 'varios',
    art: 'kit',
    rating: 4,
    reviews: 33,
    description:
      'Cable dual RCA y Clip Cord en un solo producto. Blindado, flexible y con conectores bañados en oro para cero pérdida de señal.',
    specs: [
      ['Conexión', 'RCA y Clip Cord'],
      ['Largo', '2 m'],
      ['Conectores', 'Bañados en oro'],
    ],
  },
  {
    slug: 'papel-transfer-atsui',
    name: 'Papel Transfer Atsui x50',
    brand: 'Atsui',
    price: 5990,
    category: 'varios',
    art: 'stencil',
    rating: 5,
    reviews: 67,
    featured: true,
    description:
      'Papel de transferencia Atsui x50 hojas. Transferencia nítida y duradera en cualquier máquina de copiado. El elegido por tatuadores que no negocian la línea del diseño.',
    specs: [
      ['Cantidad', 'x50 hojas'],
      ['Compatibilidad', 'Cualquier fotocopiadora/impresora'],
    ],
  },
]

export const BRANDS = [
  'Black Sheep',
  'Filter',
  'EZ Revolution',
  'Dynamic',
  'Elephant Klug',
  'Vincent',
  'Biomaser',
]

export const FAQS: [string, string][] = [
  [
    '¿Hacen envíos a todo el país?',
    'Sí, llegamos a todo el país con Correo Argentino y Andreani. Los pedidos se despachan en 24 hs hábiles y te mandamos el seguimiento por WhatsApp y mail.',
  ],
  [
    '¿Cuáles son los métodos de pago?',
    'Aceptamos todas las tarjetas de crédito y débito, Mercado Pago y transferencia bancaria. Con tarjetas seleccionadas tenés 3 cuotas sin interés.',
  ],
  [
    '¿Cuánto tarda en llegar mi pedido?',
    'En AMBA, entre 24 y 48 hs. Al interior, entre 2 y 5 días hábiles según la zona. Si lo necesitás urgente para una sesión, escribinos y vemos cómo apurarlo.',
  ],
  [
    '¿Puedo cambiar o devolver un producto?',
    'Tenés 30 días para cambios y devoluciones de productos sin abrir. Los insumos estériles (agujas, cartuchos) solo se cambian si el empaque está intacto.',
  ],
  [
    '¿Los productos son originales?',
    'Todos. Trabajamos directo con los distribuidores oficiales de cada marca. Nada de réplicas: acá se tatúa con lo posta.',
  ],
  [
    '¿Tienen garantía los productos?',
    'Los equipos y accesorios tienen garantía de 6 meses. Cualquier problema, lo resolvemos nosotros con el fabricante.',
  ],
]

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug)
}

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function productsByCategory(slug: string) {
  return PRODUCTS.filter((p) => p.category === slug)
}
