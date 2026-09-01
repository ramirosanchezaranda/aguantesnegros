import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { MascotMoodProvider } from './context/MascotMoodContext'
import { CatalogProvider } from './context/CatalogContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider } from './context/SettingsContext'
import './styles/global.css'

// HashRouter para builds embebidos (p. ej. preview de una sola página),
// donde no hay servidor que resuelva rutas reales.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <MascotMoodProvider>
          <CatalogProvider>
            <AdminAuthProvider>
              <SettingsProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </SettingsProvider>
            </AdminAuthProvider>
          </CatalogProvider>
        </MascotMoodProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
)
