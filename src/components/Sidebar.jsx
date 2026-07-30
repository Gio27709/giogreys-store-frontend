import { useAuth } from '../context/AuthContext';
import {
  Store,
  LayoutDashboard,
  Boxes,
  Tag,
  Truck,
  ShoppingCart,
  Users,
  Receipt,
  Settings,
  Lock,
  UserCheck,
  LogOut,
} from 'lucide-react';
import './Sidebar.css';

export function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="brand-icon-wrapper">
          <Store size={22} />
        </div>
        <div className="brand-info">
          <h1>Giogreys Store</h1>
          <span>Gestión & POS Enterprise</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-group-label">Módulos Principales</div>

        <button
          className={`sidebar-link ${activeTab === 'pos' ? 'active' : ''}`}
          onClick={() => setActiveTab('pos')}
        >
          <div className="sidebar-link-left">
            <ShoppingCart className="sidebar-icon" size={18} />
            <span>Punto de Venta (POS)</span>
          </div>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'cash-register' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash-register')}
        >
          <div className="sidebar-link-left">
            <Lock className="sidebar-icon" size={18} />
            <span>Arqueo & Cierre Caja</span>
          </div>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <div className="sidebar-link-left">
            <Boxes className="sidebar-icon" size={18} />
            <span>Inventario & Productos</span>
          </div>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <div className="sidebar-link-left">
            <Receipt className="sidebar-icon" size={18} />
            <span>Historial de Ventas</span>
          </div>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <div className="sidebar-link-left">
            <Users className="sidebar-icon" size={18} />
            <span>Clientes</span>
          </div>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="sidebar-link-left">
            <LayoutDashboard className="sidebar-icon" size={18} />
            <span>Panel Principal</span>
          </div>
        </button>

        <div className="nav-group-label" style={{ marginTop: '0.85rem' }}>Configuración & Sistema</div>

        <button
          className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <div className="sidebar-link-left">
            <UserCheck className="sidebar-icon" size={18} />
            <span>Usuarios & Empleados</span>
          </div>
        </button>

        <button
          className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <div className="sidebar-link-left">
            <Settings className="sidebar-icon" size={18} />
            <span>Configuración & Tasas</span>
          </div>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="user-avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.username || 'Usuario'}</span>
            <span className="user-role-badge">{user?.role || 'admin'}</span>
          </div>
        </div>

        <button onClick={logout} className="btn-logout-sidebar" title="Cerrar Sesión">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
