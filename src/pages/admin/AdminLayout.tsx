import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { backendName } from '../../lib/catalog'
import AdminLogin from './AdminLogin'

export default function AdminLayout() {
  const { session, signOut } = useAdminAuth()
  const navigate = useNavigate()

  if (!session) return <AdminLogin />

  return (
    // Defensa en profundidad: si Clarity ya se cargó en la tienda y el admin
    // navega hasta acá, el contenido igual va enmascarado.
    <div className="admin" data-clarity-mask="true">
      <aside className="admin__side">
        <div className="admin__brand">
          <span className="admin__brand-mark">◑</span>
          <div>
            <strong>Gestión</strong>
            <small>A Guantes Negros</small>
          </div>
        </div>
        <nav className="admin__nav">
          <NavLink to="/admin" end>
            Productos
          </NavLink>
          <NavLink to="/admin/categorias">Categorías</NavLink>
          <NavLink to="/admin/ventas">Ventas</NavLink>
          <NavLink to="/admin/clientes">Clientes</NavLink>
          <NavLink to="/admin/estadisticas">Estadísticas</NavLink>
        </nav>
        <div className="admin__side-foot">
          <p className="admin__backend">
            Backend: <strong>{backendName}</strong>
          </p>
          <p className="admin__user">{session.email}</p>
          <button
            className="admin__signout"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            Cerrar sesión
          </button>
          <NavLink to="/" className="admin__back">
            ← Volver a la tienda
          </NavLink>
        </div>
      </aside>
      <main className="admin__main">
        <Outlet />
      </main>
    </div>
  )
}
