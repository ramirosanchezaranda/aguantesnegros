import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import { MascotMoodProvider } from './context/MascotMoodContext'
import { CatalogProvider } from './context/CatalogContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { CartProvider } from './context/CartContext'
import './styles/global.css'

// HashRouter para builds embebidos (p. ej. preview de una sola página),
// donde no hay servidor que resuelva rutas reales.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <MascotMoodProvider>
        <CatalogProvider>
          <AdminAuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AdminAuthProvider>
        </CatalogProvider>
      </MascotMoodProvider>
    </Router>
  </React.StrictMode>,
)
