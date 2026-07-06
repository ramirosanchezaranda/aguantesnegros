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

-- ---- Row Level Security --------------------------------------------------
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- Lectura pública
create policy "categories_read_public" on public.categories
  for select using (true);
create policy "products_read_public" on public.products
  for select using (true);

-- Escritura sólo autenticados (admin logueado con Supabase Auth)
create policy "categories_write_auth" on public.categories
  for all to authenticated using (true) with check (true);
create policy "products_write_auth" on public.products
  for all to authenticated using (true) with check (true);

-- ==========================================================================
-- Después de correr esto:
--   1. Authentication → Users → creá tu usuario admin (email + password).
--   2. Cargá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env.
--   3. Sembrá los productos con el panel /admin, o importándolos desde
--      src/data/catalog.ts (mismo shape, campos en snake_case).
-- ==========================================================================
