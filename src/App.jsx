import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Navbar } from './components/Navbar';
import { ShieldCheck, Package, ShoppingCart, Users, CheckCircle2 } from 'lucide-react';
import './App.css';

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#818cf8',
        fontSize: '1.2rem',
        fontWeight: '500',
        gap: '0.75rem'
      }}>
        <div className="spinner" style={{ width: '28px', height: '28px' }}></div>
        <span>Cargando sistema Giogreys Store...</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="welcome-banner">
          <div className="welcome-text">
            <h1>¡Bienvenido de nuevo, {user.username}! 👋</h1>
            <p>Sistema de gestión de inventario y ventas autenticado mediante token JWT seguro.</p>
          </div>
          <div className="auth-status-chip">
            <ShieldCheck size={20} />
            <span>Sesión Activa ({user.role})</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">
              <Package size={24} />
            </div>
            <div className="stat-info">
              <h3>Inventario Base</h3>
              <p className="stat-number">12 Tablas 3NF</p>
              <span className="stat-status"><CheckCircle2 size={14} /> PostgreSQL Supabase</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon indigo">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-info">
              <h3>Punto de Venta</h3>
              <p className="stat-number">Multimoneda</p>
              <span className="stat-status"><CheckCircle2 size={14} /> USD / VES / COP</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon cyan">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>Control de Usuarios</h3>
              <p className="stat-number">Rol: {user.role}</p>
              <span className="stat-status"><CheckCircle2 size={14} /> Auth JWT & Bcrypt</span>
            </div>
          </div>
        </div>

        <div className="audit-section">
          <h2>🟢 Auditoría de Inicio de Sesión Exitosa</h2>
          <p>
            El módulo de **Autenticación e Inicio de Sesión** ha sido implementado y verificado.
            El token JWT emitido por el backend NestJS se almacena en el cliente y valida cada petición protegida.
          </p>
        </div>
      </main>
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
