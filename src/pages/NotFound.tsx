import { useEffect } from 'react'
import { MascotImage } from '../components/mascot/Mascot'
import { Button } from '../components/ui'
import { useMascotMood } from '../context/MascotMoodContext'

export default function NotFound() {
  const { setBaseMood } = useMascotMood()

  useEffect(() => {
    setBaseMood('sad')
    return () => setBaseMood('happy')
  }, [setBaseMood])

  return (
    <main className="page">
      <div className="container cart-empty">
        <MascotImage variant="question" className="cart-empty__mascot" title="Guantín perdido" />
        <p className="notfound__code">404</p>
        <h1 className="page__title">Esta página se borró como tinta blanca</h1>
        <p className="page__sub">Lo que buscás no está acá. Pero tranqui, Guantín te lleva de vuelta.</p>
        <Button to="/" arrow>
          Volver al inicio
        </Button>
      </div>
    </main>
  )
}
