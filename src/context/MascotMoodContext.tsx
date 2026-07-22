import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import type { Mood } from '../components/mascot/Mascot'

interface MascotMoodValue {
  mood: Mood
  /** Estado base (persistente) del logo. */
  setBaseMood: (m: Mood) => void
  /** Reacción momentánea: vuelve al estado base al terminar. */
  pulse: (m: Mood, ms?: number) => void
}

const Ctx = createContext<MascotMoodValue>({ mood: 'happy', setBaseMood: () => {}, pulse: () => {} })

export function MascotMoodProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<Mood>('happy')
  const base = useRef<Mood>('happy')
  const timer = useRef<number>()

  const setBaseMood = useCallback((m: Mood) => {
    base.current = m
    if (!timer.current) setMood(m)
  }, [])

  const pulse = useCallback((m: Mood, ms = 1400) => {
    window.clearTimeout(timer.current)
    setMood(m)
    timer.current = window.setTimeout(() => {
      timer.current = undefined
      setMood(base.current)
    }, ms)
  }, [])

  return <Ctx.Provider value={{ mood, setBaseMood, pulse }}>{children}</Ctx.Provider>
}

export function useMascotMood() {
  return useContext(Ctx)
}
