import { useAuth } from '../context/AuthContext';
import { Store, User, LogOut } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar-container">
      <div className="navbar-brand">
        <div className="navbar-logo-icon">
          <Store size={22} />
        </div>
        <div>
          <h2 className="navbar-title">Giogreys Store</h2>
          <p className="navbar-subtitle">Gestión de Inventario & POS</p>
        </div>
      </div>

      <div className="navbar-user-section">
        {user && (
          <div className="user-badge-wrapper">
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-role-tag">{user.role}</span>
            </div>
          </div>
        )}

        <button onClick={logout} className="btn-logout" title="Cerrar sesión">
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}
