import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { SHIPPING_METHODS, type ShippingMethod } from '../data/shop'
import { defaultShippingSettings, loadShippingSettings, type ShippingSettings } from '../lib/settings'

// Los precios de envío se editan desde el panel. La tienda arranca con los
// valores por defecto y los reemplaza cuando llega la configuración guardada,
// así el primer render nunca queda en blanco.

interface SettingsValue {
  /** Métodos ya resueltos: sólo los habilitados, con el precio vigente. */
  shippingMethods: ShippingMethod[]
  freeShippingThreshold: number
  settings: ShippingSettings
  reload: () => Promise<void>
}

const Ctx = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShippingSettings>(defaultShippingSettings)

  const reload = useCallback(async () => {
    setSettings(await loadShippingSettings())
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const value = useMemo<SettingsValue>(() => {
    const shippingMethods = SHIPPING_METHODS.filter((m) => settings.methods[m.id]?.enabled !== false).map((m) => ({
      ...m,
      price: settings.methods[m.id]?.price ?? m.price,
    }))
    return {
      // Nunca se deja la lista vacía: sin métodos no se podría comprar.
      shippingMethods: shippingMethods.length ? shippingMethods : SHIPPING_METHODS,
      freeShippingThreshold: settings.freeThreshold,
      settings,
      reload,
    }
  }, [settings, reload])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettings(): SettingsValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSettings fuera de SettingsProvider')
  return ctx
}
