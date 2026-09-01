-- ==========================================================================
-- A Guantes Negros — esquema de gestión de stock para Supabase
-- ==========================================================================
-- Ejecutá este script en el SQL Editor de tu proyecto Supabase.
-- Crea las tablas `categories` y `products` con RLS:
--   · lectura pública (la tienda)
--   · escritura sólo para usuarios autenticados (el panel /admin)

-- ---- Categorías ----------------------------------------------------------
create table if not exists public.categories (
  slug     text primary key,
  name     text not null,
  tagline  text not null default '',
  mascot   text not null default 'hero',
  art      text not null default 'kit'
);

-- ---- Productos -----------------------------------------------------------
create table if not exists public.products (
  slug        text primary key,
  name        text not null,
  brand       text not null default '',
  price       integer not null default 0,
  compare_at  integer,
  category    text not null references public.categories (slug) on update cascade,
  art         text not null default 'kit',
  rating      numeric not null default 5,
  reviews     integer not null default 0,
  badge       text,
  featured    boolean not null default false,
  description text not null default '',
  specs       jsonb not null default '[]'::jsonb,
  stock       integer not null default 0
);

-- Se filtra por categoría en cada página de categoría.
create index if not exists products_category_idx on public.products (category);

-- ---- Row Level Security --------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- Se borran primero para que el script se pueda correr más de una vez.
drop policy if exists "categories_read_public" on public.categories;
drop policy if exists "products_read_public"   on public.products;
drop policy if exists "categories_write_auth"  on public.categories;
drop policy if exists "products_write_auth"    on public.products;
drop policy if exists "categories_write_admin" on public.categories;
drop policy if exists "products_write_admin"   on public.products;

-- Lectura pública
create policy "categories_read_public" on public.categories
  for select using (true);
create policy "products_read_public" on public.products
  for select using (true);

-- Escritura sólo para el admin de la tienda.
--
-- Se valida el email del JWT, no alcanza con estar autenticado: aunque el
-- registro público quedara abierto por error, un usuario recién creado no
-- puede tocar el catálogo. Para cambiar de admin, editá el email de las dos
-- políticas y volvé a correr este script.
create policy "categories_write_admin" on public.categories
  for all to authenticated
  using      (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com')
  with check (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');
create policy "products_write_admin" on public.products
  for all to authenticated
  using      (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com')
  with check (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Fotos de producto ---------------------------------------------------
-- Hasta 3 por producto, opcionales: si el arreglo está vacío, la tienda usa la
-- ilustración de la marca. Las imágenes viven en Storage; acá van sus URLs.
alter table public.products add column if not exists image_urls jsonb not null default '[]'::jsonb;

-- Migración desde la primera versión, que guardaba una sola foto en image_url.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products' and column_name = 'image_url'
  ) then
    update public.products
       set image_urls = jsonb_build_array(image_url)
     where image_url is not null and image_url <> '' and image_urls = '[]'::jsonb;
    alter table public.products drop column image_url;
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product_images_read_public" on storage.objects;
drop policy if exists "product_images_write_admin" on storage.objects;

-- Mismo criterio que el catálogo: las ve cualquiera, las cambia sólo el admin.
create policy "product_images_read_public" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_write_admin" on storage.objects
  for all to authenticated
  using      (bucket_id = 'product-images' and auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com')
  with check (bucket_id = 'product-images' and auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Colores y costo ------------------------------------------------------
-- `colors`: hasta 5 hex por producto, se muestran en la ficha.
-- `cost`: precio de compra. Sin él sólo se puede medir facturación, no ganancia.
alter table public.products add column if not exists colors jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists cost integer;

-- ---- Pedidos -------------------------------------------------------------
-- Sin esto no hay historial de ventas: el checkout no guardaba nada.
create table if not exists public.orders (
  id         text primary key,
  created_at timestamptz not null default now(),
  items      jsonb not null default '[]'::jsonb,
  subtotal   integer not null default 0,
  discount   integer not null default 0,
  shipping   integer not null default 0,
  total      integer not null default 0,
  coupon     text
);

-- Datos del comprador y cómo se cierra el pedido. Son datos personales:
-- por eso `orders` sólo la puede leer el admin (política más abajo).
alter table public.orders add column if not exists customer jsonb;
alter table public.orders add column if not exists shipping_method text;
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists address jsonb;

create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_insert_public" on public.orders;
drop policy if exists "orders_read_admin"   on public.orders;

-- Cualquiera puede registrar su compra: el checkout no pide cuenta.
create policy "orders_insert_public" on public.orders
  for insert to anon, authenticated with check (true);

-- Pero leerlos es sólo del admin: son datos del negocio, no del público.
create policy "orders_read_admin" on public.orders
  for select to authenticated
  using (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Carritos (medición de abandono) --------------------------------------
-- Sin datos personales: un id aleatorio del navegador, qué se puso en el
-- carrito y cuándo. Sirve para contar abandono, no para contactar a nadie.
create table if not exists public.carts (
  id           text primary key,
  updated_at   timestamptz not null default now(),
  items        jsonb not null default '[]'::jsonb,
  subtotal     integer not null default 0,
  converted_at timestamptz
);

create index if not exists carts_updated_at_idx on public.carts (updated_at desc);

alter table public.carts enable row level security;

drop policy if exists "carts_write_public" on public.carts;
drop policy if exists "carts_update_public" on public.carts;
drop policy if exists "carts_read_admin"   on public.carts;

-- El visitante no tiene cuenta, así que escribe de forma anónima. El id es un
-- UUID aleatorio: no se puede adivinar el de otro.
create policy "carts_write_public" on public.carts
  for insert to anon, authenticated with check (true);

-- Sólo se puede seguir modificando un carrito que todavía no se convirtió,
-- para que un convertido no pueda alterarse después.
create policy "carts_update_public" on public.carts
  for update to anon, authenticated
  using (converted_at is null) with check (true);

create policy "carts_read_admin" on public.carts
  for select to authenticated
  using (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Configuración de la tienda -------------------------------------------
-- Existió una tabla `settings` que guardaba los precios de envío editables.
-- La tienda ya no cotiza envíos —se coordinan por WhatsApp con la dirección
-- que deja el cliente— así que nada la lee. Si la creaste antes, podés
-- borrarla; queda comentado porque borrar datos tiene que ser una decisión
-- tuya, no un efecto secundario de correr este archivo:
--
--   drop table if exists public.settings;

-- ==========================================================================
-- Después de correr esto:
--   1. Authentication → Users → creá el usuario admin con el MISMO email que
--      figura en las políticas de arriba, marcando "Auto Confirm User".
--   2. Cargá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env y en el
--      hosting (las VITE_* se hornean en el build: hay que redeployar).
--   3. Corré supabase/seed.sql para cargar el catálogo.
--   4. Authentication → Providers → Email: desactivá "Allow new users to
--      sign up". Ya no es la única defensa —las políticas validan el email—
--      pero evita que se acumulen cuentas basura.
-- ==========================================================================
