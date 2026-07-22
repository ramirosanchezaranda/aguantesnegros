# A Guantes Negros — E-commerce de insumos para tatuar

Tienda e-commerce premium para **A Guantes Negros**, marca argentina de insumos
para tatuadores. Estética callejera, moderna y canchera, con la mascota oficial
—un guante negro haciendo la V— como hilo conductor de toda la experiencia.

## Stack

- **React 18 + TypeScript** con **Vite**
- **React Router** para navegación multi-página
- **Clash Display** (Fontshare) como tipografía de marca
- CSS propio con sistema de diseño (tokens, grilla de 8px), sin frameworks

## La mascota como sistema

El personaje NO se rediseña: se dibuja una sola vez como componente vectorial
(`src/components/mascot/Mascot.tsx`) con cuerpo, cara, lentes y proporciones
fijas. Las **variantes oficiales** solo cambian la pose y el objeto que sostiene:

`hero` · `machine` · `ink` · `cream` · `power` · `pointing` · `walking` ·
`gloves` · `rock` · `question` · `cart`

Cada sección usa una variante distinta (categorías, banner, FAQ, carrito, etc.).

### Logo reactivo

El isologo del header (`LogoMark.tsx`) reacciona a lo que hace el usuario, vía
`MascotMoodContext`:

- **peek** — espía por encima de los lentes al pasar el mouse por el logo
- **excited** — festeja (rebota + estrellas) al agregar un producto al carrito,
  al hacer click en el logo o al confirmar la compra
- **sad** — se pone triste con el carrito vacío o en la página 404
- **happy** — estado base

## Páginas

Home · Categorías · Listado por categoría · Producto (PDP) · Carrito ·
Checkout (multi-paso) · FAQ · 404

## Scripts

```bash
npm install
npm run dev      # desarrollo
npm run build    # build de producción
npm run preview  # previsualizar el build
```

## Paleta

Negro `#0B0B0B` · Rojo `#E53935` · Crema `#F8F3EA` · Gris `#EFEFEF` · Blanco
