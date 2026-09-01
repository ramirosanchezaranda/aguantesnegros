import { useEffect, useState } from 'react'
import { SHIPPING_METHODS } from '../../data/shop'
import { useSettings } from '../../context/SettingsContext'
import { saveShippingSettings, type ShippingSettings } from '../../lib/settings'
import { formatPrice } from '../../lib/format'

// Los precios de envío se editan acá en vez de estar en el código: cambiar una
// tarifa no debería requerir un deploy.

export default function AdminShipping() {
  const { settings, reload } = useSettings()
  const [draft, setDraft] = useState<ShippingSettings>(settings)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // La configuración llega por red: se copia al borrador cuando aparece.
  useEffect(() => {
    setDraft(settings)
  }, [settings])

  function setPrice(id: string, price: number) {
    setDraft((d) => ({ ...d, methods: { ...d.methods, [id]: { ...d.methods[id], price } } }))
  }

  function toggle(id: string, enabled: boolean) {
    setDraft((d) => ({ ...d, methods: { ...d.methods, [id]: { ...d.methods[id], enabled } } }))
  }

  const habilitados = SHIPPING_METHODS.filter((m) => draft.methods[m.id]?.enabled !== false).length

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMsg(null)
    if (habilitados === 0) {
      setError('Dejá al menos un método habilitado: si no, nadie puede terminar una compra.')
      return
    }
    setBusy(true)
    try {
      await saveShippingSettings({
        freeThreshold: Math.max(0, Math.round(draft.freeThreshold)),
        methods: Object.fromEntries(
          Object.entries(draft.methods).map(([id, v]) => [id, { price: Math.max(0, Math.round(v.price)), enabled: v.enabled }]),
        ),
      })
      await reload()
      setMsg('Envíos actualizados. Ya se ven así en la tienda.')
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
          <h1>Envíos</h1>
          <p className="admin-page__meta">
            {habilitados} de {SHIPPING_METHODS.length} métodos activos
          </p>
        </div>
      </header>

      {error && <p className="admin-alert admin-alert--error">{error}</p>}
      {msg && <p className="admin-alert">{msg}</p>}

      <form className="admin-form" onSubmit={submit}>
        <div className="ship-rows">
          {SHIPPING_METHODS.map((m) => {
            const cfg = draft.methods[m.id] ?? { price: m.price, enabled: true }
            return (
              <div className={`ship-row ${cfg.enabled ? '' : 'ship-row--off'}`} key={m.id}>
                <label className="ship-row__on">
                  <input type="checkbox" checked={cfg.enabled} onChange={(e) => toggle(m.id, e.target.checked)} />
                  <span className="sr-only">Activar {m.label}</span>
                </label>
                <div className="ship-row__info">
                  <strong>{m.label}</strong>
                  <small>{m.detail}</small>
                </div>
                <label className="ship-row__price">
                  <span>Precio</span>
                  <input
                    type="number"
                    min={0}
                    value={cfg.price}
                    disabled={!cfg.enabled}
                    onChange={(e) => setPrice(m.id, Number(e.target.value))}
                  />
                </label>
              </div>
            )
          })}
        </div>

        <label className="admin-field">
          Envío gratis a partir de ($)
          <input
            type="number"
            min={0}
            value={draft.freeThreshold}
            onChange={(e) => setDraft((d) => ({ ...d, freeThreshold: Number(e.target.value) }))}
          />
          <span className="admin-field__hint">
            Compras de {formatPrice(draft.freeThreshold || 0)} o más no pagan envío. Poné 0 para no bonificar nunca.
          </span>
        </label>

        <div className="admin-form__foot">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar envíos'}
          </button>
        </div>
      </form>

      <p className="admin-page__meta">
        Son precios fijos por método. Las tarifas reales de OCA y Correo dependen del código postal y del peso: cobrarlas
        exactas requiere integrar una API de logística.
      </p>
    </div>
  )
}
