# Estado del proyecto

Lo que hay que hacer, lo que está a medias y las decisiones que conviene no
volver a discutir. Se actualiza a mano cuando algo cambia.

Última revisión: **2 de septiembre de 2026**

---

## Pendiente de tu lado

### 1. Completar los datos legales del responsable

En `src/data/shop.ts` hay tres constantes vacías:

```ts
export const LEGAL_NAME = ''      // razón social o tu nombre
export const LEGAL_TAX_ID = ''    // CUIT o CUIL
export const LEGAL_ADDRESS = ''   // domicilio a efectos legales
```

La página `/privacidad` omite lo que no esté cargado, así que no se ve rota,
pero **la Ley 25.326 pide nombre y domicilio de quien guarda los datos**. Hoy
la tienda guarda nombre, mail, WhatsApp y dirección de cada comprador, y corre
Microsoft Clarity. Son tres strings.

### 2. Revisar 92 precios de venta

De los productos cargados desde los PDFs del proveedor, 92 tienen el **costo
real** pero el **precio de venta lo calculó Claude** con `costo × 1,365`
redondeado a la centena.

No se pudo reproducir tu criterio porque no es una fórmula: `6500 → 8900` es
×1,369, pero `7900 → 10900` es ×1,380 y `12900 → 17500` es ×1,357. Redondeás a
ojo. Los calculados pueden quedar hasta un 2 % por debajo de lo que pondrías.

Para verlos:

```sql
select name, cost, price, round(price::numeric/cost, 3) as markup
from products
where price = round(cost * 1.365 / 100) * 100
order by name;
```

### 3. Borrar 7 duplicados

El mismo producto cargado dos veces, con precio idéntico. Quedaron sin tocar
porque borrar no se deshace. Los redundantes son los que llevan prefijo:

- `Aguja Blacksheep 5RL x50u` (queda `Blacksheep 5RL x50u`)
- `Aguja Blacksheep 7RL x50u` (queda `Blacksheep 7RL x50u`)
- `Bioseguridad Cubre Clip-cord 6x50cm x100u`
- `Bioseguridad Cubre Máquina x100u`
- `Bioseguridad Cubre Pen Black Latex x100u`
- `Bioseguridad Cubre Pen DTS Cristal + Adhesivo Universal x100u`
- `Bioseguridad Cubre Pen DTS Universal x100u`

### 4. Política de privacidad revisada por alguien que sepa

El texto describe lo que el código realmente hace y cubre lo que pide la ley,
pero **las dos leyendas obligatorias se escribieron de memoria**. Conviene
verificarlas contra el texto oficial de la AAIP. Lo mismo con los plazos de
devolución en `/defensa-al-consumidor`.

---

## Catálogo: cómo quedó

**506 productos**, todos con costo y precio, sin nombres sucios ni slugs
repetidos.

| Categoría | Productos |
| --- | ---: |
| Agujas | 426 |
| Pigmentos | 40 |
| Varios | 29 |
| Bioseguridad | 11 |

Lo que se corrigió sobre la carga original de 414:

- **36 productos mal categorizados.** `Varios` tenía un solo producto: las
  vaselinas, butters, termocopiadoras y papeles estaban en `Agujas` y
  `Bioseguridad`.
- **32 nombres rotos**, terminados en `| |` de una carga anterior.
- **92 productos agregados** que faltaban y el proveedor tiene con precio.

### 81 productos que no se cargaron

Figuran **S/STOCK** en las listas del proveedor, así que no tienen precio de
costo. Inventarles uno sería peor que no tenerlos. Son 23 Asiáticas, 14 Spark,
13 NyN, 9 Spark Tifany, 5 Carbon King y el resto sueltas. Cuando el proveedor
los reponga, se cargan con el chat de **Productos por IA**.

---

## Fotos de producto

**323 de 506 productos tienen foto.** Salieron de las 118 imágenes embebidas en
los PDFs del proveedor, no de internet: el contenedor donde corre Claude tiene
el egress bloqueado, y las fotos de fabricantes y competidores tienen derechos.

Son **20 archivos WebP de 900 px en `public/products/catalogo/`**, 568 KB en
total. Se asignan por familia, no por SKU, porque el proveedor pone una foto por
sección: todas las `Aguja Spark …` comparten la caja Spark, que es lo que la
caja realmente es.

**Quedaron 183 sin foto**: Carbon, Carbon King, Blackbird, Blacksheep, Bronc,
Diamond, Inkplay, EZ Epic y Spark Tifany. No se les puso ninguna a propósito —
deducir la familia por el texto de la página ponía una caja Spark en Carbon y
una Mast Pro en Diamond. Una foto equivocada es peor que la ilustración.

Si conseguís fotos de esas marcas, se cargan desde el panel del producto.

---

## Dos implementaciones del mismo lector de archivos

En septiembre se escribieron en paralelo dos lectores de listas de proveedor: uno
en `src/lib/admin/fileParser.ts` (main) y otro en `src/lib/productImport.ts` +
`src/lib/pdfText.ts` (rama de Claude). Al fusionarlos se conservó la interfaz y
las funciones nuevas de main —categorías predictivas, detección de duplicados,
autoguardado— y se reemplazó el motor de lectura, que sobre los PDF reales no
funcionaba: pegaba todo el texto con espacios y su expresión regular leía `$65`
de "INKPLAY FINISH TATTOO 65ML" en vez de los `$3.190` que era el precio. Sobre
el mismo archivo, ninguno de los 24 "productos" que detectaba tenía un precio
mayor a $1.000.

Si alguna vez hay que volver a tocar esto, los dos puntos que hacen que un PDF
de lista se lea bien son:

1. **Agrupar los fragmentos por cercanía vertical, no redondeando a una grilla.**
   El precio suele ir en un cuerpo más grande y su línea de base cae dos o tres
   unidades más abajo que la del nombre; con una grilla fija, dos valores casi
   iguales terminan en filas distintas según dónde caiga el límite.
2. **Traducir los huecos horizontales grandes a tabulaciones.** Sin eso una fila
   es `Vaselina Chica 4.990` y no hay forma de saber qué número es el precio.

Y en las filas con menos celdas que el encabezado —típico cuando el PDF tiene una
columna de fotos, que no deja texto— las posiciones no sirven: ahí se identifica
por contenido, lo que parece importe es importe y el resto junto es el nombre.

---

## Decisiones que ya se tomaron

**Los envíos no se cotizan en la web.** Se coordinan por WhatsApp. El checkout
igual pide provincia, ciudad, dirección y código postal, los cuatro
obligatorios: es lo que permite cotizar y despachar sin volver a escribirle al
cliente. El resumen dice "A coordinar por WhatsApp", no "Gratis".

**No se guarda ningún dato de tarjeta.** Con tarjeta se manda un link de Mercado
Pago y el pago ocurre allá.

**"Productos por IA" no usa ningún modelo de lenguaje.** Es un léxico de
sinónimos y unas reglas en `src/lib/productCommand.ts`. Predecible, gratis y
funciona sin conexión; a cambio sólo entiende las palabras del léxico, por eso
todo lo que interpreta se muestra editable antes de guardar. Si aparecen formas
de escribir que usás seguido y no reconoce, se agregan al léxico: es una línea
por sinónimo.

**Las escrituras del panel fallan fuerte si la sesión venció.** Antes
`sbHeaders()` caía a la anon key, las políticas de la base filtraban todo y
PostgREST devolvía 204 — o sea que borrar un producto decía "listo" y no
borraba nada. Ahora `sbAdminHeaders()` no cae a la anon key y las escrituras
verifican que hayan tocado alguna fila.

---

## Cómo probar el proyecto localmente

El contenedor de Claude **no llega a `supabase.co` ni a `vercel.app`** (el proxy
de egress los bloquea). Para probar contra el catálogo semilla en localStorage
hay que buildear sin las variables:

```bash
mv .env .env.real && npm run build && npx vite preview --port 5180
# al terminar: mv .env.real .env
```

El MCP de Supabase sí llega a la base, pero entra como administrador y **saltea
las políticas RLS**: sirve para diagnosticar y para operaciones puntuales, no
para reproducir lo que hace la app con la sesión de un usuario.

---

## Variables de entorno

| Variable | Dónde | Estado |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Vercel + `.env` | cargada |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env` | cargada |
| `VITE_CLARITY_ID` | Vercel (producción) | cargada — `ybaffrh01j` |

Las `VITE_*` se hornean en el build: cambiar una exige redeploy.
