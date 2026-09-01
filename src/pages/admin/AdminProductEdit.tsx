import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { getRepo } from '../../lib/catalog'
import { ACCEPTED_IMAGE_TYPES } from '../../lib/images'
import ProductArt from '../../components/ProductArt'
import { DEFAULT_STOCK, type ArtKind, type Product } from '../../data/catalog'

const ART_KINDS: ArtKind[] = [
  'pen',
  'rotary',
  'cartridge',
  'ink',
  'power',
  'grip',
  'gloves',
  'cream',
  'kit',
  'pedal',
  'film',
  'soap',
  'stencil',
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function emptyProduct(category: string): Product {
  return {
    slug: '',
    name: '',
    brand: 'A Guantes Negros',
    price: 0,
    category,
    art: 'kit',
    rating: 5,
    reviews: 0,
    description: '',
    specs: [],
    stock: DEFAULT_STOCK,
  }
}

export default function AdminProductEdit() {
  const { slug } = useParams()
  const isNew = !slug
  const { getProduct, categories, reload } = useCatalog()
  const navigate = useNavigate()

  const initial = useMemo<Product>(() => {
    if (slug) {
      const found = getProduct(slug)
      if (found) return { ...found, specs: found.specs.map((s) => [...s] as [string, string]) }
    }
    return emptyProduct(categories[0]?.slug ?? 'varios')
  }, [slug, getProduct, categories])

  const [form, setForm] = useState<Product>(initial)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function onNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: isNew && !slugTouched ? slugify(name) : f.slug }))
  }

  async function onPickImage(file: File | undefined) {
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const url = await getRepo().uploadImage(form.slug || slugify(form.name) || 'producto', file)
      set('imageUrl', url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  function setSpec(i: number, side: 0 | 1, value: string) {
    setForm((f) => {
      const specs = f.specs.map((s) => [...s] as [string, string])
      specs[i][side] = value
      return { ...f, specs }
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.slug.trim()) return setError('El slug es obligatorio')
    if (!form.name.trim()) return setError('El nombre es obligatorio')
    if (isNew && getProduct(form.slug)) return setError(`Ya existe un producto con el slug "${form.slug}"`)
    setBusy(true)
    try {
      const clean: Product = {
        ...form,
        price: Math.max(0, Math.round(form.price)),
        compareAt: form.compareAt ? Math.round(form.compareAt) : undefined,
        stock: Math.max(0, Math.round(form.stock ?? 0)),
        rating: Math.min(5, Math.max(0, form.rating)),
        reviews: Math.max(0, Math.round(form.reviews)),
        badge: form.badge?.trim() || undefined,
        specs: form.specs.filter(([k, v]) => k.trim() || v.trim()),
      }
      await getRepo().saveProduct(clean)
      await reload()
      navigate('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link to="/admin" className="admin-page__crumb">
            ← Productos
          </Link>
          <h1>{isNew ? 'Nuevo producto' : `Editar: ${initial.name}`}</h1>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <form className="admin-form" onSubmit={submit}>
        <div className="admin-form__grid">
          <label className="admin-field admin-field--wide">
            Nombre
            <input value={form.name} onChange={(e) => onNameChange(e.target.value)} required />
          </label>

          <label className="admin-field">
            Slug (URL)
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true)
                set('slug', slugify(e.target.value))
              }}
              disabled={!isNew}
              required
            />
          </label>

          <label className="admin-field">
            Marca
            <input value={form.brand} onChange={(e) => set('brand', e.target.value)} />
          </label>

          <label className="admin-field">
            Categoría
            <select value={form.category} onChange={(e) => set('category', e.target.value)}>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            Ilustración
            <select value={form.art} onChange={(e) => set('art', e.target.value as ArtKind)}>
              {ART_KINDS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            Precio ($)
            <input type="number" min={0} value={form.price} onChange={(e) => set('price', Number(e.target.value))} required />
          </label>

          <label className="admin-field">
            Precio tachado ($)
            <input
              type="number"
              min={0}
              value={form.compareAt ?? ''}
              onChange={(e) => set('compareAt', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="opcional"
            />
          </label>

          <label className="admin-field">
            Stock (unidades)
            <input type="number" min={0} value={form.stock ?? 0} onChange={(e) => set('stock', Number(e.target.value))} required />
          </label>

          <label className="admin-field">
            Etiqueta / badge
            <input
              value={form.badge ?? ''}
              onChange={(e) => set('badge', e.target.value)}
              placeholder="ej. MÁS VENDIDO"
            />
          </label>

          <label className="admin-field">
            Rating (0–5)
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={form.rating}
              onChange={(e) => set('rating', Number(e.target.value))}
            />
          </label>

          <label className="admin-field">
            Reseñas
            <input type="number" min={0} value={form.reviews} onChange={(e) => set('reviews', Number(e.target.value))} />
          </label>

          <label className="admin-field admin-field--checkbox">
            <input type="checkbox" checked={!!form.featured} onChange={(e) => set('featured', e.target.checked)} />
            Destacado en la home
          </label>
        </div>

        <div className="admin-field admin-field--wide">
          Imagen del producto
          <div className="admin-image">
            <span className="admin-image__preview">
              <ProductArt product={form} />
            </span>
            <div className="admin-image__actions">
              <input
                id="product-image"
                className="admin-image__input"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                disabled={uploading}
                onChange={(e) => {
                  void onPickImage(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <label htmlFor="product-image" className="admin-btn admin-btn--white admin-image__btn">
                {uploading ? 'Subiendo…' : form.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
              </label>
              {form.imageUrl && (
                <button
                  type="button"
                  className="admin-btn admin-btn--sm admin-btn--danger"
                  onClick={() => set('imageUrl', undefined)}
                  disabled={uploading}
                >
                  Quitar
                </button>
              )}
              <p className="admin-image__hint">
                {form.imageUrl
                  ? 'Se muestra esta foto en la tienda.'
                  : 'Sin foto se usa la ilustración de la marca. JPG, PNG o WebP.'}
              </p>
            </div>
          </div>
        </div>

        <label className="admin-field admin-field--wide">
          Descripción
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} />
        </label>

        <fieldset className="admin-specs">
          <legend>Especificaciones</legend>
          {form.specs.map((s, i) => (
            <div className="admin-specs__row" key={i}>
              <input value={s[0]} onChange={(e) => setSpec(i, 0, e.target.value)} placeholder="Atributo" />
              <input value={s[1]} onChange={(e) => setSpec(i, 1, e.target.value)} placeholder="Valor" />
              <button
                type="button"
                className="admin-btn admin-btn--sm admin-btn--danger"
                onClick={() => setForm((f) => ({ ...f, specs: f.specs.filter((_, j) => j !== i) }))}
                aria-label="Quitar especificación"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => setForm((f) => ({ ...f, specs: [...f.specs, ['', '']] }))}
          >
            + Agregar especificación
          </button>
        </fieldset>

        <div className="admin-form__foot">
          <Link to="/admin" className="admin-btn admin-btn--ghost">
            Cancelar
          </Link>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </div>
  )
}
