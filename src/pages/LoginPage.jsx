import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, User, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import './LoginPage.css';

export function LoginPage() {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(usernameOrEmail, password);
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand-icon">
            <Store size={32} />
          </div>
          <h1 className="login-title">Giogreys Store</h1>
          <p className="login-subtitle">Sistema de Gestión de Inventario y Ventas</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="usernameOrEmail">
              Usuario o Correo Electrónico
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="usernameOrEmail"
                type="text"
                className="form-input"
                placeholder="ej. admin o correo@tienda.com"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer-hint">
          Credenciales por defecto: <span className="demo-credentials">admin / admin123</span>
        </div>
      </div>
    </div>
  );
}
