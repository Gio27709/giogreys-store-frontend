import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCustomersAPI, createCustomerAPI } from '../services/posService';
import { Search, Plus, UserCheck, X, AlertCircle } from 'lucide-react';
import './CustomersPage.css';

export function CustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Formulario
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomersAPI(token, search);
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await createCustomerAPI(token, {
        fullName: fullName.trim(),
        idNumber: idNumber.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      });
      setShowModal(false);
      setFullName('');
      setIdNumber('');
      setPhone('');
      setEmail('');
      setAddress('');
      await loadCustomers();
    } catch (err) {
      setError(err.message || 'Error al crear cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customers-container">
      <div className="inventory-actions-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="inventory-search-input"
            placeholder="Buscar por Nombre, Cédula/RIF o Teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="input-icon" size={18} />
        </div>

        <button onClick={() => setShowModal(true)} className="btn-action-primary">
          <Plus size={18} />
          <span>Nuevo Cliente</span>
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
              <p>Cargando directorio de clientes...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={48} />
              <h4>No hay clientes registrados</h4>
              <p>Agrega un nuevo cliente para gestionar sus compras.</p>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Cédula / RIF</th>
                  <th>Teléfono</th>
                  <th>Correo Electrónico</th>
                  <th>Dirección</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700 }}>{c.fullName}</td>
                    <td>
                      <span className="sku-badge">{c.idNumber || 'Sin RIF/CI'}</span>
                    </td>
                    <td>{c.phone || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{c.address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Registrar Nuevo Cliente</h2>
              <button onClick={() => setShowModal(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="ej. María Rodríguez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-grid-2" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cédula / RIF</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="V-12345678"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="+58 412-0000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Dirección</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Ciudad, Sector..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
