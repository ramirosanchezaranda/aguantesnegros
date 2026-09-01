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

## Backend: Supabase

La app funciona con dos backends y elige solo según las variables de entorno:

- **Sin variables** → modo local: el catálogo vive en `localStorage` del navegador.
  Ideal para demos. El panel `/admin` entra con contraseña (`guantin` por defecto).
- **Con variables** → Supabase: catálogo compartido en Postgres y login real de
  admin con email y contraseña. El panel muestra cuál está activo.

### Puesta en marcha

1. En el SQL Editor de Supabase, corré `supabase/schema.sql` (tablas + RLS) y
   después `supabase/seed.sql` (catálogo). El seed es idempotente: podés
   volver a correrlo para resincronizar.
2. **Authentication → Users → Add user**: creá el admin con el **mismo email
   que figura en las políticas de `schema.sql`**, marcando *Auto Confirm*. Sin
   confirmar, el login falla.
3. **Authentication → Providers → Email**: desactivá *Allow new users to sign
   up*. Es defensa en profundidad: las políticas ya validan el email del admin,
   pero esto evita que se acumulen cuentas basura.
4. Copiá las credenciales a `.env` (local) y a las variables de entorno de tu
   hosting:

   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
   ```

   Las `VITE_*` se embeben en el build: después de cambiarlas hay que
   **volver a deployar**.

La anon key es pública por diseño (viaja en el bundle). Lo que protege los
datos es RLS: lectura para todos, y escritura sólo para el email del admin
—no alcanza con estar autenticado—. Para cambiar de admin, editá el email en
las dos políticas de `supabase/schema.sql` y volvé a correr el script.

### Regenerar el seed

`supabase/seed.sql` se genera desde `src/data/catalog.ts`. Si cambiás el
catálogo semilla, regeneralo y volvé a correrlo en Supabase.

### Despliegue (SPA)

La app usa `BrowserRouter`, así que rutas como `/admin` o `/categoria/agujas`
no existen como archivos en el build. `vercel.json` reescribe cualquier ruta a
`index.html` para que React Router la resuelva del lado del cliente; sin eso,
entrar directo a una ruta o refrescar devuelve el 404 de Vercel. Los archivos
estáticos (`/assets`, `/products`, `/mascot`, `/favicon`) no se ven afectados:
Vercel busca en el filesystem antes de aplicar los rewrites.
