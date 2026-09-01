import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import FaviconController from './components/FaviconController'
import Home from './pages/Home'
import Categories from './pages/Categories'
import Category from './pages/Category'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Faq from './pages/Faq'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductEdit from './pages/admin/AdminProductEdit'
import AdminCategories from './pages/admin/AdminCategories'
import AdminStats from './pages/admin/AdminStats'
import { initClarity } from './lib/clarity'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  // Analítica sólo en la tienda. Si alguien entra directo al panel, Clarity
  // no se carga en toda la sesión.
  useEffect(() => {
    if (!isAdmin) initClarity()
  }, [isAdmin])

  return (
    <>
      <FaviconController />
      <ScrollToTop />
      {!isAdmin && <Header />}
      <div className="route-fade" key={pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/categoria/:slug" element={<Category />} />
          <Route path="/producto/:slug" element={<Product />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminProducts />} />
            <Route path="productos/nuevo" element={<AdminProductEdit />} />
            <Route path="productos/:slug" element={<AdminProductEdit />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="estadisticas" element={<AdminStats />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAdmin && <Footer />}
    </>
  )
}
