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
  stock       integer not null default 0,
  colors      jsonb not null default '[]'::jsonb,
  cost        integer,
  image_urls  jsonb not null default '[]'::jsonb,
  image_url   text
);

-- ---- Row Level Security --------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- Lectura pública
create policy "categories_read_public" on public.categories
  for select using (true);
create policy "products_read_public" on public.products
  for select using (true);

-- Escritura sólo para admin (aguantesnegros.info@gmail.com)
create policy "categories_write_admin" on public.categories
  for all to authenticated 
  using (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com')
  with check (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

create policy "products_write_admin" on public.products
  for all to authenticated
  using (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com')
  with check (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Órdenes ---------------------------------------------------------------
create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  customer jsonb,
  items jsonb not null default '[]'::jsonb,
  shipping_method text,
  payment_method text,
  address jsonb,
  subtotal integer not null default 0,
  discount integer not null default 0,
  shipping integer not null default 0,
  total integer not null default 0,
  coupon text
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
alter table public.orders enable row level security;

create policy "orders_insert_public" on public.orders
  for insert to anon, authenticated with check (true);
create policy "orders_read_admin" on public.orders
  for select to authenticated
  using (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Carritos ---------------------------------------------------------------
create table if not exists public.carts (
  id text primary key,
  updated_at timestamptz not null default now(),
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  converted_at timestamptz
);
create index if not exists carts_updated_at_idx on public.carts (updated_at desc);
alter table public.carts enable row level security;

create policy "carts_write_public" on public.carts
  for insert to anon, authenticated with check (true);
create policy "carts_update_public" on public.carts
  for update to anon, authenticated
  using (converted_at is null) with check (true);
create policy "carts_read_admin" on public.carts
  for select to authenticated
  using (auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Storage para imágenes de productos -----------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "product_images_read_public" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_write_admin" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com')
  with check (bucket_id = 'product-images' and auth.jwt() ->> 'email' = 'aguantesnegros.info@gmail.com');

-- ---- Notificar cambios de schema al PostgREST ----------------------------
notify pgrst, 'reload schema';

-- ==========================================================================
-- Después de correr esto:
--   1. Authentication → Users → creá el usuario admin con:
--      Email: aguantesnegros.info@gmail.com
--      Password: (define una segura)
--   2. Cargá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env.
--   3. Solo aguantesnegros.info@gmail.com puede:
--      - Acceder al panel /admin
--      - Editar, crear y eliminar productos
--      - Ver órdenes y carritos
--   4. Los clientes pueden:
--      - Ver el catálogo
--      - Crear órdenes
--      - Gestionar carritos (antes de convertirlos)
-- ==========================================================================
