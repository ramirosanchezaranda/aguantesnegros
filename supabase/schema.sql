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
