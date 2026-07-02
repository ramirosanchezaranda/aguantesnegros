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
}

export const CATEGORIES: Category[] = [
  { slug: 'maquinas', name: 'Máquinas', tagline: 'Rotativas, pen e inalámbricas', mascot: 'machine', art: 'pen' },
  { slug: 'agujas', name: 'Agujas', tagline: 'Cartuchos para todos los estilos', mascot: 'pointing', art: 'cartridge' },
  { slug: 'tintas', name: 'Tintas', tagline: 'Negras, líneas y color', mascot: 'ink', art: 'ink' },
  { slug: 'fuentes', name: 'Fuentes', tagline: 'Potencia estable, sesión tranquila', mascot: 'power', art: 'power' },
  { slug: 'accesorios', name: 'Accesorios', tagline: 'Grips, pedales y clip cords', mascot: 'rock', art: 'grip' },
  { slug: 'proteccion', name: 'Protección', tagline: 'Guantes, film y barreras', mascot: 'gloves', art: 'gloves' },
  { slug: 'aftercare', name: 'Aftercare', tagline: 'Cremas y cuidado post tattoo', mascot: 'cream', art: 'cream' },
  { slug: 'kits', name: 'Kits', tagline: 'Todo listo para arrancar', mascot: 'walking', art: 'kit' },
]

export const PRODUCTS: Product[] = [
  {
    slug: 'maquina-inalambrica-clash-pro',
    name: 'Máquina Inalámbrica Clash Pro',
    brand: 'FK Irons',
    price: 189990,
    category: 'maquinas',
    art: 'pen',
    rating: 5,
    reviews: 24,
    badge: 'MÁS VENDIDA',
    featured: true,
    description:
      'La Clash Pro es una máquina inalámbrica diseñada para brindar precisión, potencia y comodidad en cada sesión. Motor silencioso, batería de larga duración y un balance pensado para sesiones largas. Ideal para todo tipo de técnicas.',
    specs: [
      ['Tipo', 'Pen inalámbrica'],
      ['Stroke', '3.5 mm'],
      ['Batería', 'Hasta 8 horas'],
      ['Peso', '160 g'],
      ['Voltaje', '5V – 12V regulable'],
    ],
  },
  {
    slug: 'maquina-rotativa-spectra-x',
    name: 'Máquina Rotativa Spectra X',
    brand: 'FK Irons',
    price: 219990,
    category: 'maquinas',
    art: 'rotary',
    rating: 5,
    reviews: 18,
    badge: 'NUEVA',
    featured: true,
    description:
      'La Spectra X redefine la rotativa profesional: torque parejo, golpe consistente y una ergonomía que se siente desde la primera línea. Para tatuadores que no negocian precisión.',
    specs: [
      ['Tipo', 'Rotativa'],
      ['Stroke', '4.0 mm'],
      ['Conexión', 'RCA'],
      ['Peso', '120 g'],
    ],
  },
  {
    slug: 'maquina-pen-thunder',
    name: 'Máquina Pen Thunder',
    brand: 'Dynamic',
    price: 169990,
    category: 'maquinas',
    art: 'pen',
    rating: 4,
    reviews: 31,
    description:
      'Una pen confiable, pareja y silenciosa. La Thunder es la compañera ideal para líneas finas y sombras suaves, con un agarre cómodo para sesiones largas.',
    specs: [
      ['Tipo', 'Pen'],
      ['Stroke', '3.5 mm'],
      ['Conexión', 'DC'],
      ['Peso', '140 g'],
    ],
  },
  {
    slug: 'maquina-rotativa-eclipse',
    name: 'Máquina Rotativa Eclipse',
    brand: 'Bishop',
    price: 199990,
    category: 'maquinas',
    art: 'rotary',
    rating: 5,
    reviews: 12,
    description:
      'La Eclipse combina un motor japonés de alta gama con un cuerpo liviano de aluminio. Silenciosa, estable y lista para cualquier estilo.',
    specs: [
      ['Tipo', 'Rotativa directa'],
      ['Stroke', '3.5 mm'],
      ['Conexión', 'RCA'],
      ['Peso', '95 g'],
    ],
  },
  {
    slug: 'maquina-pen-invictus',
    name: 'Máquina Pen Invictus',
    brand: 'Cheyenne',
    price: 179990,
    category: 'maquinas',
    art: 'pen',
    rating: 4,
    reviews: 22,
    description:
      'Precisión alemana en formato pen. La Invictus entrega un golpe constante y un control absoluto de la aguja, sesión tras sesión.',
    specs: [
      ['Tipo', 'Pen'],
      ['Stroke', '3.6 mm'],
      ['Conexión', 'Jack 3.5'],
      ['Peso', '130 g'],
    ],
  },
  {
    slug: 'maquina-hibrida-fusion',
    name: 'Máquina Híbrida Fusion',
    brand: 'Critical',
    price: 229990,
    category: 'maquinas',
    art: 'rotary',
    rating: 5,
    reviews: 9,
    badge: 'PRO',
    description:
      'Lo mejor de dos mundos: funciona con batería inalámbrica o cable RCA. Stroke intercambiable y potencia de sobra para líneas, sombras y empaquetado.',
    specs: [
      ['Tipo', 'Híbrida'],
      ['Stroke', '3.0 / 3.5 / 4.0 mm'],
      ['Batería', 'Hasta 6 horas'],
      ['Peso', '155 g'],
    ],
  },
  {
    slug: 'agujas-cartucho-rl-1205',
    name: 'Agujas Cartucho RL 1205',
    brand: 'Kwadron',
    price: 19990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 56,
    badge: 'MÁS VENDIDAS',
    featured: true,
    description:
      'Caja x20 cartuchos round liner 1205. Membrana de seguridad, agujas afiladas con precisión y flujo de tinta constante. Las líneas salen solas.',
    specs: [
      ['Configuración', '1205 RL'],
      ['Cantidad', 'Caja x20'],
      ['Membrana', 'Sí'],
      ['Esterilización', 'E.O. Gas'],
    ],
  },
  {
    slug: 'agujas-cartucho-rm-1209',
    name: 'Agujas Cartucho RM 1209',
    brand: 'Kwadron',
    price: 21990,
    category: 'agujas',
    art: 'cartridge',
    rating: 5,
    reviews: 41,
    description:
      'Caja x20 cartuchos round magnum 1209. Perfectas para sombras suaves y transiciones limpias, con la calidad Kwadron de siempre.',
    specs: [
      ['Configuración', '1209 RM'],
      ['Cantidad', 'Caja x20'],
      ['Membrana', 'Sí'],
    ],
  },
  {
    slug: 'agujas-cartucho-m1-1215',
    name: 'Agujas Cartucho M1 1215',
    brand: 'Cheyenne',
    price: 24990,
    category: 'agujas',
    art: 'cartridge',
    rating: 4,
    reviews: 27,
    description:
      'Caja x20 cartuchos magnum 1215 para empaquetar color y sombras sólidas. Compatibles con todas las pen estándar.',
    specs: [
      ['Configuración', '1215 M1'],
      ['Cantidad', 'Caja x20'],
      ['Membrana', 'Sí'],
    ],
  },
  {
    slug: 'tinta-intenze-true-black-30ml',
    name: 'Tinta Intenze 30ml True Black',
    brand: 'Intenze',
    price: 9490,
    category: 'tintas',
    art: 'ink',
    rating: 5,
    reviews: 84,
    featured: true,
    description:
      'El negro más confiable del mercado. True Black entra parejo, cura oscuro y se mantiene intenso con los años. Un clásico que no falla.',
    specs: [
      ['Contenido', '30 ml / 1 oz'],
      ['Color', 'True Black'],
      ['Origen', 'USA'],
      ['Vegana', 'Sí'],
    ],
  },
  {
    slug: 'tinta-dynamic-black-8oz',
    name: 'Tinta Dynamic Black 8oz',
    brand: 'Dynamic',
    price: 34990,
    category: 'tintas',
    art: 'ink',
    rating: 5,
    reviews: 63,
    badge: 'CLÁSICA',
    description:
      'La botella que está en todos los estudios. Dynamic Black: fluida para líneas, sólida para relleno, rendidora como ninguna.',
    specs: [
      ['Contenido', '240 ml / 8 oz'],
      ['Color', 'Negro'],
      ['Origen', 'USA'],
    ],
  },
  {
    slug: 'tinta-eternal-lining-black-60ml',
    name: 'Tinta Eternal Lining Black 60ml',
    brand: 'Eternal Ink',
    price: 18990,
    category: 'tintas',
    art: 'ink',
    rating: 4,
    reviews: 38,
    description:
      'Formulada específicamente para líneas: densa, oscura y de curado limpio. Tus lineworks van a quedar afilados por décadas.',
    specs: [
      ['Contenido', '60 ml / 2 oz'],
      ['Color', 'Lining Black'],
      ['Vegana', 'Sí'],
    ],
  },
  {
    slug: 'fuente-critical-atomx',
    name: 'Fuente Critical AtomX',
    brand: 'Critical',
    price: 149990,
    category: 'fuentes',
    art: 'power',
    rating: 5,
    reviews: 33,
    badge: 'PRO',
    featured: true,
    description:
      'Compacta, precisa y con memoria de voltaje. La AtomX es la fuente que eligen los profesionales: pantalla clara, control fino y cero interferencias.',
    specs: [
      ['Voltaje', '0 – 18 V'],
      ['Pantalla', 'LED'],
      ['Modos', 'Continuo / Pedal'],
      ['Tamaño', '76 x 76 mm'],
    ],
  },
  {
    slug: 'fuente-critical-cx2-g2',
    name: 'Fuente Critical CX-2 G2',
    brand: 'Critical',
    price: 189990,
    category: 'fuentes',
    art: 'power',
    rating: 5,
    reviews: 15,
    description:
      'Dos salidas independientes, memoria para dos máquinas y construcción de tanque. Para estudios que trabajan en serio.',
    specs: [
      ['Voltaje', '0 – 18 V'],
      ['Salidas', '2 independientes'],
      ['Pantalla', 'LED dual'],
    ],
  },
  {
    slug: 'pedal-inalambrico-critical',
    name: 'Pedal Inalámbrico Critical',
    brand: 'Critical',
    price: 89990,
    category: 'accesorios',
    art: 'pedal',
    rating: 4,
    reviews: 19,
    description:
      'Libertad total de movimiento: pedal inalámbrico con respuesta instantánea y batería para semanas de trabajo.',
    specs: [
      ['Conexión', 'Wireless'],
      ['Batería', '30 días de uso'],
      ['Compatible', 'Fuentes Critical'],
    ],
  },
  {
    slug: 'grip-ergonomico-32mm',
    name: 'Grip Ergonómico 32mm',
    brand: 'Dynamic',
    price: 14990,
    category: 'accesorios',
    art: 'grip',
    rating: 4,
    reviews: 45,
    description:
      'Grip descartable de espuma de 32mm. Menos tensión en la mano, más control en el trazo. Caja x12 unidades.',
    specs: [
      ['Diámetro', '32 mm'],
      ['Material', 'Espuma'],
      ['Cantidad', 'Caja x12'],
    ],
  },
  {
    slug: 'clip-cord-premium',
    name: 'Clip Cord Premium RCA',
    brand: 'Bishop',
    price: 24990,
    category: 'accesorios',
    art: 'grip',
    rating: 5,
    reviews: 28,
    description:
      'Cable RCA blindado con malla textil. Flexible, resistente y sin falsos contactos, para que la sesión no se corte nunca.',
    specs: [
      ['Conexión', 'RCA'],
      ['Largo', '2 m'],
      ['Malla', 'Textil'],
    ],
  },
  {
    slug: 'guantes-nitrilo-negros-x100',
    name: 'Guantes Nitrilo Negros x100',
    brand: 'A Guantes Negros',
    price: 15990,
    category: 'proteccion',
    art: 'gloves',
    rating: 5,
    reviews: 112,
    badge: 'LA CASA',
    featured: true,
    description:
      'Los que le dan nombre a la casa. Guantes de nitrilo negros, resistentes, sin látex y con el calce justo. Caja x100 unidades.',
    specs: [
      ['Material', 'Nitrilo'],
      ['Color', 'Negro'],
      ['Cantidad', 'Caja x100'],
      ['Talles', 'S / M / L / XL'],
    ],
  },
  {
    slug: 'film-protector-10m',
    name: 'Film Protector 10m',
    brand: 'Dynamic',
    price: 8990,
    category: 'proteccion',
    art: 'film',
    rating: 4,
    reviews: 34,
    description:
      'Rollo de film para cubrir máquinas, camillas y superficies. Higiene sin vueltas, sesión tras sesión.',
    specs: [
      ['Largo', '10 m'],
      ['Ancho', '15 cm'],
    ],
  },
  {
    slug: 'barreras-clip-cord-x125',
    name: 'Barreras Clip Cord x125',
    brand: 'Critical',
    price: 11990,
    category: 'proteccion',
    art: 'film',
    rating: 5,
    reviews: 23,
    description:
      'Fundas descartables para clip cord. Caja x125 unidades. Tu cable protegido, tu estación impecable.',
    specs: [
      ['Cantidad', 'Caja x125'],
      ['Material', 'Polietileno'],
    ],
  },
  {
    slug: 'crema-aftercare-balm',
    name: 'Crema Aftercare Balm',
    brand: 'A Guantes Negros',
    price: 12990,
    category: 'aftercare',
    art: 'cream',
    rating: 5,
    reviews: 76,
    featured: true,
    description:
      'Bálsamo post tattoo con manteca de karité y caléndula. Cura mejor, pica menos y los negros quedan negros.',
    specs: [
      ['Contenido', '100 g'],
      ['Base', 'Vegetal'],
      ['Uso', 'Post sesión'],
    ],
  },
  {
    slug: 'jabon-espuma-foam-clean',
    name: 'Jabón Espuma Foam Clean',
    brand: 'Intenze',
    price: 9990,
    category: 'aftercare',
    art: 'soap',
    rating: 4,
    reviews: 29,
    description:
      'Espuma limpiadora neutra para usar durante y después de la sesión. Limpia sin irritar y prepara la piel para el aftercare.',
    specs: [
      ['Contenido', '250 ml'],
      ['pH', 'Neutro'],
    ],
  },
  {
    slug: 'stencil-transfer-gel',
    name: 'Stencil Transfer Gel',
    brand: 'Eternal Ink',
    price: 13990,
    category: 'accesorios',
    art: 'stencil',
    rating: 5,
    reviews: 52,
    description:
      'El gel que hace que el stencil aguante toda la sesión. Transferencia nítida, secado rápido y cero corridas.',
    specs: [
      ['Contenido', '120 ml'],
      ['Secado', '60 segundos'],
    ],
  },
  {
    slug: 'kit-inicio-pro',
    name: 'Kit Inicio Pro',
    brand: 'A Guantes Negros',
    price: 349990,
    compareAt: 419990,
    category: 'kits',
    art: 'kit',
    rating: 5,
    reviews: 21,
    badge: 'OFERTA',
    description:
      'Todo lo que necesitás para arrancar como profesional: máquina pen, fuente, cartuchos, tintas, grips y protección. Armado por tatuadores, para tatuadores.',
    specs: [
      ['Incluye', 'Pen + Fuente + Cartuchos'],
      ['Tintas', 'Black 30ml x2'],
      ['Extras', 'Grips + Guantes + Film'],
    ],
  },
]

export const BRANDS = [
  'Critical',
  'FK Irons',
  'Dynamic',
  'Intenze',
  'Cheyenne',
  'Bishop',
  'Eternal Ink',
  'Kwadron',
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
    'Las máquinas y fuentes tienen garantía oficial de 6 a 12 meses según la marca. Cualquier drama, lo resolvemos nosotros con el fabricante.',
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
