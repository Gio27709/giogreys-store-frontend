import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InventoryPage } from './pages/InventoryPage';
import { PosPage } from './pages/PosPage';
import { CustomersPage } from './pages/CustomersPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { ShieldCheck, Package, ShoppingCart, Users, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import './App.css';

const API_BASE_URL = '/api';

function DashboardView({ token, user }) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch(`${API_BASE_URL}/sales/metrics/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMetrics();
  }, [token]);

  return (
    <>
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>¡Bienvenido de nuevo, {user.username}! 👋</h1>
          <p>Sistema de gestión de inventario y ventas autenticado mediante token JWT seguro.</p>
        </div>
        <div className="auth-status-chip">
          <ShieldCheck size={18} />
          <span>Sesión Activa ({user.role})</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <DollarSign size={22} />
          </div>
          <div className="stat-info">
            <h3>Ventas Totales USD</h3>
            <p className="stat-number">${metrics ? Number(metrics.totalRevenueUsd).toFixed(2) : '0.00'}</p>
            <span className="stat-status"><CheckCircle2 size={14} /> Facturación POS</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon indigo">
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <h3>Ganancia Neta Estimada</h3>
            <p className="stat-number" style={{ color: '#059669' }}>
              ${metrics ? Number(metrics.netProfitUsd).toFixed(2) : '0.00'}
            </p>
            <span className="stat-status"><CheckCircle2 size={14} /> Venta - Costo</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <ShoppingCart size={22} />
          </div>
          <div className="stat-info">
            <h3>Facturas Procesadas</h3>
            <p className="stat-number">{metrics ? metrics.totalSalesCount : 0} ventas</p>
            <span className="stat-status"><CheckCircle2 size={14} /> {metrics ? metrics.totalItemsSold : 0} ítems vendidos</span>
          </div>
        </div>
      </div>

      <div className="audit-section">
        <h2>🟢 Módulo Financiero & Configuración Activo</h2>
        <p>
          El sistema está procesando transacciones en tiempo real en Supabase PostgreSQL.
          Puedes ajustar las tasas de cambio (BCV / COP) en el menú **Configuración & Tasas** o consultar recibos pasados en **Historial de Ventas**.
        </p>
      </div>
    </>
  );
}

function MainApp() {
  const { user, token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('pos');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff5f8',
        color: '#d97706',
        fontSize: '1.1rem',
        fontWeight: '700',
        gap: '0.75rem'
      }}>
        <div className="spinner" style={{ width: '28px', height: '28px' }}></div>
        <span>Cargando Giogreys Store Enterprise...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-root-layout">
      {/* Sidebar Fijo a la Izquierda */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Viewport Principal (Header + Workspace) */}
      <div className="app-main-viewport">
        <Header activeTab={activeTab} />

        <main className="workspace-content">
          {activeTab === 'pos' ? (
            <PosPage />
          ) : activeTab === 'inventory' ? (
            <InventoryPage />
          ) : activeTab === 'history' ? (
            <SalesHistoryPage />
          ) : activeTab === 'customers' ? (
            <CustomersPage />
          ) : activeTab === 'settings' ? (
            <SettingsPage />
          ) : (
            <DashboardView token={token} user={user} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
