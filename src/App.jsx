import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InventoryPage } from './pages/InventoryPage';
import { PosPage } from './pages/PosPage';
import { CustomersPage } from './pages/CustomersPage';
import { ShieldCheck, Package, ShoppingCart, Users, CheckCircle2 } from 'lucide-react';
import './App.css';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('pos'); // Default to POS for instant billing testing

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
          ) : activeTab === 'customers' ? (
            <CustomersPage />
          ) : (
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
                    <Package size={22} />
                  </div>
                  <div className="stat-info">
                    <h3>Inventario Base</h3>
                    <p className="stat-number">12 Tablas 3NF</p>
                    <span className="stat-status"><CheckCircle2 size={14} /> PostgreSQL Supabase</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon indigo">
                    <ShoppingCart size={22} />
                  </div>
                  <div className="stat-info">
                    <h3>Punto de Venta</h3>
                    <p className="stat-number">Multimoneda</p>
                    <span className="stat-status"><CheckCircle2 size={14} /> USD / VES / COP</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon cyan">
                    <Users size={22} />
                  </div>
                  <div className="stat-info">
                    <h3>Control de Usuarios</h3>
                    <p className="stat-number">Rol: {user.role}</p>
                    <span className="stat-status"><CheckCircle2 size={14} /> Auth JWT & Bcrypt</span>
                  </div>
                </div>
              </div>

              <div className="audit-section">
                <h2>🟢 Módulo POS Multimoneda Activo</h2>
                <p>
                  El módulo de **Punto de Venta (POS Multimoneda)** permite facturar en tiempo real con conversión instantánea a **USD**, **VES (Bs.)** y **COP ($)**, registrando clientes y descontando existencias automáticamente.
                </p>
              </div>
            </>
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
