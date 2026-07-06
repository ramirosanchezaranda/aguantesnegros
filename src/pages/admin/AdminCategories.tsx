import { useState } from 'react'
import { useCatalog } from '../../context/CatalogContext'
import { getRepo } from '../../lib/catalog'
import type { ArtKind, Category, MascotVariant } from '../../data/catalog'

const MASCOTS: MascotVariant[] = [
  'hero',
  'machine',
  'ink',
  'cream',
  'power',
  'pointing',
  'walking',
  'question',
  'rock',
  'gloves',
  'cart',
]

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

const emptyCategory: Category = { slug: '', name: '', tagline: '', mascot: 'hero', art: 'kit' }

export default function AdminCategories() {
  const { categories, productsByCategory, reload } = useCatalog()
  const [draft, setDraft] = useState<Category>(emptyCategory)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isNew = editingSlug === null

  function edit(c: Category) {
    setEditingSlug(c.slug)
    setDraft({ ...c })
    setError(null)
  }

  function resetDraft() {
    setEditingSlug(null)
    setDraft(emptyCategory)
    setError(null)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const slug = isNew ? slugify(draft.slug || draft.name) : draft.slug
    if (!slug) return setError('Falta el slug o el nombre')
    if (!draft.name.trim()) return setError('El nombre es obligatorio')
    if (isNew && categories.some((c) => c.slug === slug)) return setError(`Ya existe la categoría "${slug}"`)
    setBusy(true)
    try {
      await getRepo().saveCategory({ ...draft, slug })
      await reload()
      resetDraft()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar')
    } finally {
      setBusy(false)
    }
  }

  async function remove(c: Category) {
    const count = productsByCategory(c.slug).length
    if (count > 0) {
      window.alert(`No podés eliminar "${c.name}": tiene ${count} productos. Reasignalos primero.`)
      return
    }
    if (!window.confirm(`¿Eliminar la categoría "${c.name}"?`)) return
    setBusy(true)
    try {
      await getRepo().deleteCategory(c.slug)
      await reload()
      if (editingSlug === c.slug) resetDraft()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Categorías</h1>
          <p className="admin-page__meta">{categories.length} categorías</p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}

      <div className="admin-cats">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Productos</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.slug} className={editingSlug === c.slug ? 'admin-row--active' : ''}>
                  <td>
                    <strong>{c.name}</strong>
                    <span className="admin-table__sub">{c.tagline}</span>
                  </td>
                  <td>{productsByCategory(c.slug).length}</td>
                  <td className="admin-table__row-actions">
                    <button className="admin-btn admin-btn--sm" onClick={() => edit(c)}>
                      Editar
                    </button>
                    <button className="admin-btn admin-btn--sm admin-btn--danger" onClick={() => remove(c)} disabled={busy}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="admin-form admin-form--panel" onSubmit={save}>
          <h2 className="admin-form__title">{isNew ? 'Nueva categoría' : `Editar: ${draft.name}`}</h2>
          <label className="admin-field">
            Nombre
            <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} required />
          </label>
          <label className="admin-field">
            Slug
            <input
              value={draft.slug}
              onChange={(e) => setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))}
              disabled={!isNew}
              placeholder={isNew ? 'se genera del nombre' : undefined}
            />
          </label>
          <label className="admin-field">
            Bajada
            <input value={draft.tagline} onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))} />
          </label>
          <label className="admin-field">
            Mascota
            <select value={draft.mascot} onChange={(e) => setDraft((d) => ({ ...d, mascot: e.target.value as MascotVariant }))}>
              {MASCOTS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            Ilustración
            <select value={draft.art} onChange={(e) => setDraft((d) => ({ ...d, art: e.target.value as ArtKind }))}>
              {ART_KINDS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-form__foot">
            {!isNew && (
              <button type="button" className="admin-btn admin-btn--ghost" onClick={resetDraft}>
                Cancelar
              </button>
            )}
            <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
              {isNew ? 'Crear categoría' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
