# PRD — A Guantes Negros · E-commerce de insumos para tatuar

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Fecha | 2026-07-02 |
| Estado | Borrador para revisión |
| Rama | `claude/guantes-negros-ecommerce-hj8oiw` (PR #1) |
| Plataforma | SPA web (desktop / tablet / mobile) |

---

## 1. Visión del producto

Tienda e-commerce premium para tatuadores profesionales en Argentina, con una
identidad de marca fuerte (estética callejera, humor argentino, cultura tattoo)
construida alrededor de la mascota oficial: un guante negro haciendo la V.

**Objetivo de esta fase:** pasar de la maqueta funcional actual (catálogo
estático, compra simulada) a una tienda operable de punta a punta, con gestión
de stock, usuarios y pagos reales.

**No-objetivos (por ahora):** internacionalización, multi-moneda, marketplace
de terceros, app nativa.

---

## 2. Estado actual — lo que la app YA tiene

### 2.1 Stack

- **React 18 + TypeScript** sobre **Vite 5**.
- **React Router 6** (`BrowserRouter` en producción; `HashRouter` vía
  `VITE_HASH_ROUTER` para builds embebidos de preview).
- CSS propio con sistema de diseño: tokens en `:root`, grilla de 8 px,
  paleta negro `#0B0B0B` / rojo `#E53935` / crema `#F8F3EA` / gris `#EFEFEF`.
- Tipografía **Clash Display** servida desde Fontshare (`<link>` en
  `index.html`) con pila de fallback del sistema.
- Sin backend: todos los datos viven en `src/data/catalog.ts`.

### 2.2 Funcionalidad implementada

| Área | Detalle |
|---|---|
| Home | Hero con parallax de mouse, marquee, beneficios, grilla de 8 categorías, 7 destacados, banner promocional, grilla de 8 marcas, FAQ resumido |
| Categorías | Índice (`/categorias`) + listado por categoría (`/categoria/:slug`) con ordenamiento (destacados, precio ↑↓, rating) |
| Producto (PDP) | Galería con 3 vistas, precio + cuotas, specs, cantidad, agregar al carrito, comprar ahora, acordeones (descripción / especificaciones / envíos), relacionados, mascota señalando el CTA |
| Carrito | Context + `localStorage` (clave `agn-cart`), steppers de cantidad, eliminar, cupón `GUANTIN10` (−10 %), envío gratis ≥ $50.000, estado vacío con mascota triste |
| Checkout | 4 pasos (Datos → Envío → Pago → Confirmación), resumen sticky, redirect a carrito si está vacío, pantalla de éxito con mascota festejando |
| FAQ | 6 acordeones + CTA a WhatsApp |
| 404 | Página propia con mascota confundida |
| Catálogo | 24 productos, 8 categorías, 8 marcas — estático |

### 2.3 Sistema de mascota (activo de marca)

- `Mascot.tsx`: personaje vectorial con cuerpo/cara/lentes/proporciones
  **fijos** y 11 variantes de pose: `hero`, `machine`, `ink`, `cream`,
  `power`, `pointing`, `walking`, `gloves`, `rock`, `question`, `cart`.
- `LogoMark.tsx` + `MascotMoodContext`: logo del header **reactivo** —
  `peek` (hover en el logo), `excited` (agregar al carrito, click en logo,
  compra confirmada), `sad` (carrito vacío, 404), `happy` (base).
- `ProductArt.tsx`: 13 ilustraciones line-art de producto (placeholder de
  fotografía real).

### 2.4 UX / UI

- Microinteracciones: hover con lift/scale, botones negro→rojo, badge del
  carrito con pop, drawer de menú full-screen con reveal escalonado.
- `Reveal` on-scroll vía IntersectionObserver; `prefers-reduced-motion`
  respetado globalmente.
- Responsive completo (breakpoints 720 px / 1000 px).
- Verificado con capturas Playwright en desktop (1440) y mobile (390).

---

## 3. Lo que FALTA (gaps funcionales)

Prioridad: **P0** = bloqueante para operar · **P1** = importante · **P2** = deseable.

| # | Gap | Prioridad | Notas |
|---|---|---|---|
| F1 | **Backend real** (productos, stock, órdenes persistidas) | P0 | Ver §6 |
| F2 | **Pagos reales** — hoy el paso "Pago" es un formulario decorativo | P0 | Mercado Pago Checkout Pro + webhook |
| F3 | **Login / cuentas de usuario** — el ícono de "Mi cuenta" no hace nada | P0 | Ver §6.4 |
| F4 | **Búsqueda** — el ícono de lupa no tiene funcionalidad | P1 | Búsqueda por nombre/marca; con backend, full-text |
| F5 | **Stock visible** — no existe concepto de agotado/quedan X | P0 | Depende de F1 |
| F6 | **Variantes de producto** — los talles S/M/L/XL de guantes figuran en specs pero no son seleccionables | P1 | Modelo `product_variants` |
| F7 | **Fotos reales de producto** — hoy hay ilustraciones SVG | P1 | Upload + CDN/Storage; conservar SVG como fallback |
| F8 | **Emails transaccionales** (confirmación, seguimiento) | P1 | Resend/SES; el copy promete mail + WhatsApp |
| F9 | **Páginas legales reales** — Términos/Privacidad/Defensa al consumidor hoy linkean a `/faq` | P1 | Obligatorio para operar en AR (Ley 24.240, botón de arrepentimiento) |
| F10 | **SEO** — SPA client-side sin meta por ruta, sin sitemap ni Open Graph | P1 | Migrar a SSR/SSG (p. ej. Vite SSR o Astro islands) o prerender |
| F11 | Reseñas reales — rating y conteo son estáticos | P2 | Depende de F3 |
| F12 | Wishlist / favoritos | P2 | |
| F13 | Newsletter / captura de emails | P2 | |
| F14 | Analytics + funnel de conversión | P1 | GA4 o Plausible + eventos de carrito |
| F15 | Cálculo real de envío por CP (Correo Argentino / Andreani) | P1 | Hoy: gratis ≥ $50.000, fijo $6.990 |
| F16 | Code-splitting por ruta — bundle único de ~231 kB | P2 | `React.lazy` por página |

---

## 4. Deuda técnica y bugs por debuggear

Detectados en revisión del código actual:

| # | Bug / deuda | Severidad | Detalle y fix propuesto |
|---|---|---|---|
| B1 | **El cupón no viaja al checkout** | Alta | `Cart.tsx` calcula `discount` en estado local; `Checkout.tsx` recalcula el total desde el context sin descuento → el cliente ve un total en el carrito y otro en el checkout. Fix: mover cupón/descuento a `CartContext`. |
| B2 | **Umbral de envío inconsistente** | Media | Carrito usa `(total − discount) ≥ 50000`; checkout usa `total ≥ 50000`. Unificar en una función `shippingFor(subtotal)` compartida. |
| B3 | **Número de pedido se regenera en cada render** | Media | `Checkout.tsx` hace `Math.floor(Math.random()…)` inline en el JSX de la pantalla de éxito. Fix: generarlo una vez en estado al confirmar. |
| B4 | **Impureza en render de `Mascot`** | Media | `clipId` usa un contador de módulo (`uid++`) que muta durante el render (doble ejecución en StrictMode, ids no deterministas). Fix: `useId()` como ya hace `LogoMark`. |
| B5 | **Contenido invisible sin JS / para crawlers** | Media | `Reveal` arranca en `opacity: 0`; si el observer no corre, secciones enteras quedan ocultas (se reprodujo en capturas headless). Fix: patrón progressive-enhancement (`html.js .reveal { opacity: 0 }`) o SSR. |
| B6 | **Navegación entre rutas con smooth scroll** | Baja | `scroll-behavior: smooth` global + `ScrollToTop` hace que cada cambio de página "viaje" hasta arriba. Fix: `behavior: 'instant'` en el scroll de cambio de ruta. |
| B7 | **Íconos muertos** (lupa, usuario) | Media | Botones sin acción: implementar (F3/F4) u ocultar hasta entonces — un control que no hace nada erosiona confianza. |
| B8 | **Parallax sin throttle** | Baja | `mousemove` del hero setea CSS vars en cada evento; envolver en `requestAnimationFrame`. |
| B9 | **Accesibilidad del acordeón** | Media | El cuerpo colapsado no tiene `aria-hidden`/`inert`; su contenido sigue siendo tabulable. Falta `aria-controls`/`id` par. |
| B10 | **Focus trap del drawer** | Media | El menú full-screen no atrapa el foco ni cierra con `Escape`; falta `skip-link` global. |
| B11 | **Validación de checkout superficial** | Alta | Solo `required` nativo; sin validación de formato (email, tarjeta, CP) ni mensajes de error propios. Se resuelve en serio con F2 (el PAN nunca debe tocar nuestro front). |
| B12 | **Redondeo de cuotas duplicado** | Baja | `installments()` redondea a $10; el `<select>` de cuotas del checkout usa `Math.round` directo → montos pueden diferir. Unificar en `lib/format.ts`. |
| B13 | **`prefers-reduced-motion` global agresivo** | Baja | El override `!important` también anula transiciones funcionales (acordeón). Ajustar a animaciones decorativas. |

---

## 5. Plan de testing

Hoy: **cero tests**. Setup propuesto: **Vitest + React Testing Library +
@testing-library/user-event** (unit/integración) y **Playwright** (E2E —
`playwright-core` ya está en devDependencies).

### 5.1 Tests unitarios pendientes

**`lib/format.ts`**
- [ ] `formatPrice` — separador de miles es-AR, cero, valores grandes.
- [ ] `installments` — redondeo a $10, texto de salida, n configurable.

**`context/CartContext.tsx`**
- [ ] `add` suma ítem nuevo / incrementa existente / respeta `qty` explícita.
- [ ] `setQty(slug, 0)` elimina el ítem; negativos no rompen.
- [ ] `remove` y `clear`.
- [ ] `total` y `count` derivados correctos con múltiples ítems.
- [ ] Persistencia: escribe/lee `localStorage`, tolera JSON corrupto.
- [ ] Slugs huérfanos (producto eliminado del catálogo) se filtran sin crash.
- [ ] `add` dispara `pulse('excited')` del mood context.

**`context/MascotMoodContext.tsx`**
- [ ] `pulse` cambia el mood y vuelve al base al vencer el timeout (fake timers).
- [ ] `pulse` consecutivos reinician el timer (no quedan timeouts colgados).
- [ ] `setBaseMood` durante un pulse activo no pisa el mood momentáneo, pero sí queda como destino.

**`data/catalog.ts`** (tests de integridad de datos)
- [ ] Slugs de productos y categorías únicos.
- [ ] Toda `product.category` existe en `CATEGORIES`.
- [ ] Precios > 0; `compareAt > price` cuando existe; rating ∈ [1..5].
- [ ] `getProduct` / `getCategory` / `productsByCategory` (hit y miss).

**Componentes**
- [ ] `ProductCard`: renderiza precio/marca/badge; click en el botón agrega al carrito.
- [ ] `Accordion`: toggle de `aria-expanded`, contenido visible/oculto.
- [ ] `Header`: badge muestra `count`; drawer abre/cierra y bloquea scroll del body.
- [ ] `Reveal`: agrega `reveal--in` al intersectar (mock de IntersectionObserver).
- [ ] `Mascot`: smoke test de las 11 variantes y 5 moods (render sin throw + snapshot).
- [ ] `LogoMark`: `data-mood` correcto; estrellas solo en `excited`.

**Páginas**
- [ ] `Category`: los 4 criterios de ordenamiento ordenan bien; slug inválido → 404.
- [ ] `Cart`: cupón válido aplica −10 %, inválido no; umbral de envío gratis en $50.000 exacto.
- [ ] `Checkout`: carrito vacío redirige; avanza pasos; al confirmar limpia carrito y muestra éxito.
- [ ] `Product`: cantidad mínima 1; "Comprar ahora" agrega y navega a checkout.

### 5.2 E2E (Playwright)

- [ ] Flujo feliz completo: home → categoría → PDP → agregar → carrito → cupón → checkout 3 pasos → confirmación.
- [ ] Persistencia del carrito tras recargar.
- [ ] Navegación mobile vía drawer.
- [ ] Regresión visual de home y PDP (screenshots).

### 5.3 CI

- [ ] GitHub Actions: `tsc`, `vitest run --coverage`, `vite build`, E2E en PR.
- [ ] Umbral de cobertura inicial: 70 % en `src/lib`, `src/context`, `src/data`.

---

## 6. Nueva épica: gestión de stock, ABM de productos y logins

### 6.1 Resumen

Panel de administración (`/admin`) protegido por login con roles, que permita
**agregar, editar y eliminar productos**, controlar stock con trazabilidad,
gestionar órdenes y cupones; más **cuentas de cliente** en la tienda.

### 6.2 Decisión de arquitectura

| Opción | Pros | Contras |
|---|---|---|
| **A. Supabase** (Postgres + Auth + Storage + RLS) ✅ recomendada | Auth, DB, storage de imágenes y políticas por rol resueltos; velocidad de entrega; SQL real | Lock-in moderado (mitigable: es Postgres estándar) |
| B. API propia (Fastify + Prisma + Postgres) | Control total | Hay que construir auth, uploads, infra y seguridad a mano |
| C. Headless commerce (Medusa) | Carrito/órdenes/stock ya resueltos | Sobredimensionado para un catálogo de este tamaño; menos control del front |

**Recomendación: A.** El front actual queda como está; se reemplaza el origen
de datos y se agrega la sección admin en la misma SPA.

### 6.3 Modelo de datos

```
categories        id, slug, name, tagline, mascot_variant, position, active
brands            id, name, logo_style
products          id, slug, name, brand_id, category_id, description,
                  price_cents, compare_at_cents, badge, featured, active,
                  art_kind (fallback SVG), created_at, updated_at
product_images    id, product_id, url, alt, position
product_variants  id, product_id, name (ej. "Talle M"), sku, price_delta_cents, active
stock_movements   id, product_id, variant_id?, qty (+/-), reason
                  (compra|venta|ajuste|devolución), order_id?, user_id, created_at
                  → stock disponible = SUM(qty)  (vista materializada `stock_levels`)
profiles          id (= auth.users.id), full_name, phone, role (admin|editor|customer)
addresses         id, profile_id, province, city, street, zip, apartment
orders            id, number (AGN-XXXX), profile_id?, email, status
                  (pending|paid|shipped|delivered|cancelled),
                  subtotal_cents, discount_cents, shipping_cents, total_cents,
                  coupon_id?, payment_id (MP), shipping_address (jsonb), created_at
order_items       id, order_id, product_id, variant_id?, name_snapshot,
                  price_cents_snapshot, qty
coupons           id, code, type (percent|fixed), value, min_subtotal_cents,
                  starts_at, ends_at, max_uses, uses, active
reviews (fase 2)  id, product_id, profile_id, rating, body, approved
```

Claves del diseño:

- **Stock por movimientos, no por campo mutable** → auditoría completa de
  quién/cuándo/por qué cambió el inventario.
- **Snapshots en `order_items`** → cambiar un precio no reescribe órdenes históricas.
- **Precios en centavos (int)** → sin errores de flotante.
- El catálogo actual de `catalog.ts` se convierte en **seed** de la DB
  (script `scripts/seed.ts`), y `art_kind` se conserva como imagen de respaldo.

### 6.4 Autenticación y roles

- **Proveedor:** Supabase Auth — email + password y magic link (opcional
  Google OAuth).
- **Roles** en `profiles.role`:
  - `admin`: todo (productos, stock, órdenes, cupones, usuarios).
  - `editor`: ABM de productos y stock; no ve datos de clientes ni cupones.
  - `customer`: sus órdenes, sus direcciones, sus reseñas.
- **Enforcement en dos capas:**
  1. **RLS en Postgres** (la real): `products` legible por todos si
     `active = true`; escritura solo `admin|editor`; `orders` visibles solo
     por su dueño o staff; `stock_movements` solo staff.
  2. **Guard de rutas en el front** (`<RequireRole role="admin">`): UX, no
     seguridad.
- Sesión: la maneja el SDK de Supabase (tokens con auto-refresh). **Nunca**
  exponer la `service_role key` en el front.
- En la tienda: "Mi cuenta" (B7) pasa a login/registro + historial de pedidos
  + direcciones guardadas. Checkout como invitado sigue permitido (el email
  ancla la orden).

### 6.5 Panel `/admin` — alcance funcional

| Módulo | Funcionalidad |
|---|---|
| Dashboard | Ventas del período, órdenes pendientes, top productos, **alertas de stock bajo** (umbral configurable por producto) |
| Productos | Tabla con búsqueda/filtros/paginación · **Crear/editar**: nombre, slug autogenerado editable, marca, categoría, precio, precio tachado, badge, destacado, descripción, specs (pares clave/valor), variantes, imágenes (drag & drop a Storage) · **Eliminar = soft-delete** (`active = false`; si tiene órdenes, nunca borrado físico) |
| Stock | Vista de saldos + ajuste manual con motivo obligatorio · historial de movimientos por producto · CSV de carga masiva |
| Órdenes | Lista por estado, detalle, transición de estados (pagado → despachado con nº de tracking → entregado), reembolso/cancelación (repone stock) |
| Cupones | ABM con vigencia, tope de usos y mínimo de compra (reemplaza el `GUANTIN10` hardcodeado y de paso resuelve B1 del lado servidor) |
| Usuarios | Lista, cambio de rol (solo `admin`) |

**UI del admin:** mismo design system (tokens, tipografía, botones) pero
tratamiento utilitario — tablas densas, formularios de dos columnas, sin
mascota gigante (aparece chica en estados vacíos: "Sin resultados", mood
`question`). Rutas lazy-loaded para no engordar el bundle de la tienda.

### 6.6 Integración con la tienda actual

1. **Capa de datos:** introducir **TanStack Query** y una capa
   `src/api/` (`getProducts`, `getProduct`, `createOrder`…). Las páginas
   dejan de importar `catalog.ts` y consumen hooks (`useProducts`,
   `useProduct`) con skeletons de carga.
2. **Stock en la UI:** PDP y cards muestran "Sin stock" (botón deshabilitado)
   y "¡Últimas X unidades!" cuando `stock ≤ 5`; el stepper de cantidad se
   acota al stock disponible.
3. **Órdenes:** al confirmar checkout → `POST createOrder` valida stock **en
   transacción** (`SELECT … FOR UPDATE` / RPC de Supabase), crea la orden
   `pending` y devuelve la preferencia de pago.
4. **Pagos:** **Mercado Pago Checkout Pro**. El webhook `payment.updated`
   (Edge Function) marca la orden `paid` y registra los `stock_movements`
   de venta. Si el pago expira/falla → `cancelled` + reposición.
5. **Cupones:** validación server-side al aplicar y al crear la orden.
6. **Mascota:** los eventos del mood se conservan y se suman dos: `excited`
   cuando el pago se confirma, `alert` (variante `question`) si un ítem del
   carrito se quedó sin stock.

### 6.7 Roadmap propuesto

| Fase | Contenido | Estimación |
|---|---|---|
| 0 | Fixes B1–B4 + setup Vitest + tests de §5.1 sobre lib/context/data | 1 semana |
| 1 | Supabase: schema + RLS + seed del catálogo actual; tienda leyendo de la API con TanStack Query | 1–2 semanas |
| 2 | Auth (login/registro/roles) + guard de rutas + "Mi cuenta" básica | 1 semana |
| 3 | Admin: ABM de productos + imágenes + módulo de stock | 2 semanas |
| 4 | Órdenes reales + Mercado Pago + webhook + emails transaccionales | 2 semanas |
| 5 | Admin de órdenes/cupones, búsqueda en tienda (F4), stock visible (F5) | 1–2 semanas |
| 6 | SEO/SSR, analytics, E2E completos en CI | 1–2 semanas |

### 6.8 Criterios de aceptación de la épica

- [ ] Un `editor` puede crear un producto con imágenes y stock inicial, y verlo publicado en la tienda sin deploy.
- [ ] Eliminar un producto lo despublica sin romper órdenes históricas ni URLs (la PDP devuelve 410/redirect a categoría).
- [ ] Todo cambio de stock queda registrado con usuario, motivo y fecha.
- [ ] Dos compras simultáneas del último ítem: exactamente una se confirma; la otra recibe error claro de stock.
- [ ] Un `customer` no puede acceder a `/admin` ni leer datos de otros (verificado a nivel RLS, no solo UI).
- [ ] Una orden pagada en MP figura `paid` vía webhook aunque el comprador cierre la pestaña.
- [ ] El total mostrado en carrito, checkout y orden persistida es **idéntico** (cierra B1/B2/B12).

### 6.9 Riesgos

| Riesgo | Mitigación |
|---|---|
| Sobreventa por condiciones de carrera | Descuento de stock transaccional en DB; nunca en el cliente |
| Webhook de MP perdido | Reintentos + job de reconciliación que consulta pagos `pending` > 1 h |
| RLS mal configurada expone datos | Tests de políticas por rol en CI (suite SQL) |
| Admin engorda el bundle de la tienda | Rutas `/admin` con `React.lazy` + chunk separado |
| Migración del catálogo estático | `catalog.ts` queda como seed y fixture de tests; una sola fuente de verdad: la DB |

---

## 7. Métricas de éxito

- Conversión visita → compra ≥ 1,5 % (medible recién con F14).
- Carga: LCP < 2,5 s en 4G (hoy el bundle único lo pone en riesgo → F16).
- 0 discrepancias de stock por mes tras Fase 4.
- Cobertura de tests ≥ 70 % en `lib/`, `context/`, `data/` (Fase 0).

## 8. Preguntas abiertas

1. ¿Facturación electrónica (AFIP) dentro del alcance o se factura por fuera?
2. ¿Envíos con cotización en vivo (API Andreani/Correo) o tabla fija por zona?
3. ¿El checkout como invitado se mantiene una vez lanzados los logins? (recomendado: sí)
4. ¿Quién produce la fotografía real de producto? (F7 bloquea el "look" final de las cards)
