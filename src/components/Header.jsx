import { useAuth } from '../context/AuthContext';
import { ChevronRight } from 'lucide-react';
import './Header.css';

export function Header({ activeTab }) {
  const { user } = useAuth();

  const titleMap = {
    pos: 'Punto de Venta (POS Multimoneda)',
    inventory: 'Gestión de Inventario & Productos',
    history: 'Historial Facturación de Ventas',
    customers: 'Directorio de Clientes (CRM)',
    settings: 'Configuración & Tasas de Cambio',
    dashboard: 'Panel Principal de Métricas Financieras',
  };

  return (
    <header className="app-top-header">
      <div className="header-title-section">
        <h2>{titleMap[activeTab] || 'Giogreys Store'}</h2>
        <div className="header-breadcrumb">
          <span>Sistema</span>
          <ChevronRight size={12} />
          <span>{titleMap[activeTab] || 'Módulo'}</span>
        </div>
      </div>

      <div className="header-right-actions">
        <div className="db-status-badge">
          <span className="status-dot-pulse"></span>
          <span>Supabase PostgreSQL Cloud</span>
        </div>
      </div>
    </header>
  );
}
