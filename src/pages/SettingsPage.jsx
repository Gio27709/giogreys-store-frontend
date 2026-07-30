import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrenciesAPI } from '../services/posService';
import { DollarSign, Building, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import './SettingsPage.css';

const API_BASE_URL = '/api';

export function SettingsPage() {
  const { token } = useAuth();
  const [currencies, setCurrencies] = useState([]);
  const [rateVes, setRateVes] = useState('');
  const [rateCop, setRateCop] = useState('');

  // Datos empresa
  const [companyName, setCompanyName] = useState('Giogreys Store');
  const [taxId, setTaxId] = useState('J-00000000-0');
  const [phone, setPhone] = useState('+58 400-0000000');
  const [address, setAddress] = useState('Sede Principal');
  const [contactName, setContactName] = useState('Administrador');

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmittingRates, setIsSubmittingRates] = useState(false);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const currs = await getCurrenciesAPI(token);
        setCurrencies(currs);
        const ves = currs.find((c) => c.currencyCode === 'VES');
        const cop = currs.find((c) => c.currencyCode === 'COP');
        if (ves) setRateVes(Number(ves.rateToUsd));
        if (cop) setRateCop(Number(cop.rateToUsd));

        // Cargar empresa
        const compRes = await fetch(`${API_BASE_URL}/company`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (compRes.ok) {
          const comp = await compRes.json();
          setCompanyName(comp.name || 'Giogreys Store');
          setTaxId(comp.taxId || 'J-00000000-0');
          setPhone(comp.phone || '+58 400-0000000');
          setAddress(comp.address || 'Sede Principal');
          setContactName(comp.contactName || 'Administrador');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, [token]);

  const handleSaveRates = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingRates(true);
      setError(null);
      setMessage(null);

      if (rateVes) {
        await fetch(`${API_BASE_URL}/currencies/VES`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rateToUsd: parseFloat(rateVes) }),
        });
      }

      if (rateCop) {
        await fetch(`${API_BASE_URL}/currencies/COP`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rateToUsd: parseFloat(rateCop) }),
        });
      }

      setMessage('Tasas de cambio actualizadas correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar tasas');
    } finally {
      setIsSubmittingRates(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingCompany(true);
      setError(null);
      setMessage(null);

      await fetch(`${API_BASE_URL}/company`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: companyName,
          taxId,
          phone,
          address,
          contactName,
        }),
      });

      setMessage('Datos de la empresa actualizados correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar datos de empresa');
    } finally {
      setIsSubmittingCompany(false);
    }
  };

  return (
    <div className="settings-container">
      {message && (
        <div className="auth-status-chip" style={{ width: 'fit-content' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="login-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tasas de Cambio */}
      <div className="table-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <DollarSign size={22} color="var(--accent-gold)" />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Tasas de Cambio Oficiales (POS)</h3>
        </div>

        <form onSubmit={handleSaveRates}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tasa Bolívares (VES / 1 USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={rateVes}
                onChange={(e) => setRateVes(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tasa Pesos (COP / 1 USD) *</label>
              <input
                type="number"
                step="1"
                min="1"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={rateCop}
                onChange={(e) => setRateCop(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button type="submit" className="btn-save" disabled={isSubmittingRates}>
              <Save size={16} />
              <span>{isSubmittingRates ? 'Guardando...' : 'Actualizar Tasas de Cambio'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Datos de la Empresa */}
      <div className="table-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Building size={22} color="var(--accent-gold)" />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Datos de la Empresa / Tienda</h3>
        </div>

        <form onSubmit={handleSaveCompany}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nombre del Negocio / Tienda *</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">RIF / Cédula Fiscal</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-2" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Teléfono de Contacto</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Persona de Contacto</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Dirección Fiscal / Sede</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button type="submit" className="btn-save" disabled={isSubmittingCompany}>
              <Save size={16} />
              <span>{isSubmittingCompany ? 'Guardando...' : 'Guardar Información de Empresa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
