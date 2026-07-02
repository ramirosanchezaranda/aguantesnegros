import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { MascotMoodProvider } from './context/MascotMoodContext'
import { CartProvider } from './context/CartContext'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MascotMoodProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </MascotMoodProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
