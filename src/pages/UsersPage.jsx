import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, ShieldCheck, UserCheck, X, AlertCircle } from 'lucide-react';
import './UsersPage.css';

const API_BASE_URL = '/api';

export function UsersPage() {
  const { token } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Formulario Usuario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('vendedor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al registrar usuario');
      }

      setShowModal(false);
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('vendedor');
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="users-container">
      <div className="inventory-actions-bar">
        <h3 style={{ margin: 0, fontWeight: 800 }}>Directorio de Usuarios y Empleados</h3>

        <button onClick={() => setShowModal(true)} className="btn-action-primary">
          <Plus size={18} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {error && (
        <div className="login-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-card">
        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
              <p>Cargando lista de usuarios...</p>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo Electrónico</th>
                  <th>Rol / Permiso</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                          {u.username ? u.username.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <span>{u.username}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className="user-role-badge">{u.role}</span>
                    </td>
                    <td>
                      <span className={`stock-pill ${u.isActive ? 'optimal' : 'out'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2>Registrar Nuevo Empleado</h2>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Nombre de Usuario *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="ej. carlos_cajero"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Correo Electrónico *</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="carlos@giogreysstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Contraseña Inicial *</label>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Rol del Sistema *</label>
                <select
                  className="select-filter"
                  style={{ width: '100%' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="vendedor">Vendedor / Cajero (Acceso a POS y Arqueo)</option>
                  <option value="admin">Administrador (Acceso Total)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
