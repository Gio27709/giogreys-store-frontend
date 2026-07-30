import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Unlock, DollarSign, AlertCircle, CheckCircle2, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import './CashRegisterPage.css';

const API_BASE_URL = '/api';

export function CashRegisterPage() {
  const { token } = useAuth();
  const [registerState, setRegisterState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formulario Apertura
  const [openingAmountUsd, setOpeningAmountUsd] = useState('50');
  const [openingNotes, setOpeningNotes] = useState('');

  // Formulario Cierre / Arqueo
  const [closingAmountUsd, setClosingAmountUsd] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/cash-register/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRegisterState(data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar estado de caja');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleOpenRegister = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/cash-register/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          openingAmountUsd: parseFloat(openingAmountUsd),
          notes: openingNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al abrir caja');
      }

      await loadStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRegister = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/cash-register/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          closingAmountUsd: parseFloat(closingAmountUsd),
          notes: closingNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al realizar el arqueo de cierre');
      }

      setClosingAmountUsd('');
      setClosingNotes('');
      await loadStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
        <p>Cargando estado de la caja de ventas...</p>
      </div>
    );
  }

  const isOpen = registerState?.isOpen;
  const reg = registerState?.register;
  const summary = registerState?.salesSummary;

  return (
    <div className="cash-register-container">
      {error && (
        <div className="login-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjeta de Estado del Turno */}
      <div className="table-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: isOpen ? '#ecfdf5' : '#fff1f2',
                color: isOpen ? '#059669' : '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isOpen ? <Unlock size={24} /> : <Lock size={24} />}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                {isOpen ? 'Turno de Caja Abierto' : 'Caja Cerrada'}
              </h2>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {isOpen
                  ? `Abierto por ${reg?.openedBy?.username} a las ${new Date(reg?.openedAt).toLocaleTimeString()}`
                  : 'Registra el saldo inicial en efectivo para abrir turno y comenzar a cobrar.'}
              </span>
            </div>
          </div>

          <div>
            <span className={`stock-pill ${isOpen ? 'optimal' : 'out'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              {isOpen ? '🟢 Operativo POS' : '🔴 Caja Cerrada'}
            </span>
          </div>
        </div>
      </div>

      {/* Si la caja está CERRADA -> Formulario de Apertura */}
      {!isOpen && (
        <div className="table-card" style={{ padding: '1.75rem', maxWidth: '540px' }}>
          <h3 style={{ marginTop: 0, fontWeight: 800 }}>Apertura de Turno POS</h3>
          <form onSubmit={handleOpenRegister}>
            <div className="form-group">
              <label className="form-label">Monto Inicial Base (Efectivo USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                placeholder="50.00"
                value={openingAmountUsd}
                onChange={(e) => setOpeningAmountUsd(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Notas de Apertura</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                placeholder="ej. Turno Mañana - Fondo de caja entregado por supervisión"
                value={openingNotes}
                onChange={(e) => setOpeningNotes(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn-save" style={{ width: '100%' }} disabled={isSubmitting}>
                <Unlock size={18} />
                <span>{isSubmitting ? 'Abriendo Turno...' : 'Abrir Turno de Caja'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Si la caja está ABIERTA -> Auditoría en Vivo y Formulario de Arqueo */}
      {isOpen && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Columna Izquierda: Auditoría del Turno */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, fontWeight: 800, marginBottom: '1rem' }}>Resumen de Cobros en Turno</h3>

            <div className="totals-summary-card" style={{ marginBottom: '1.25rem' }}>
              <div className="total-row-main">
                <span>Fondo Inicial Base:</span>
                <strong style={{ color: 'var(--accent-gold)' }}>${summary?.openingAmountUsd?.toFixed(2)}</strong>
              </div>
              <div className="total-row-main" style={{ marginTop: '0.5rem' }}>
                <span>Total Ventas Turno:</span>
                <strong style={{ color: '#059669' }}>${summary?.totalSalesUsd?.toFixed(2)}</strong>
              </div>
              <div className="total-row-main" style={{ marginTop: '0.5rem', borderTop: '2px dashed #fbcfe8', paddingTop: '0.75rem' }}>
                <span>Total Esperado en Caja:</span>
                <strong style={{ fontSize: '1.4rem', color: '#059669' }}>${summary?.expectedTotalUsd?.toFixed(2)}</strong>
              </div>
            </div>

            <h4 style={{ margin: '1rem 0 0.5rem 0', fontWeight: 800, fontSize: '0.95rem' }}>
              Desglose por Métodos de Pago
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {summary?.paymentsBreakdown?.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    background: '#fff8fa',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #fbcfe8',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                      {p.currency === 'USD' ? `$${p.totalOriginal.toFixed(2)}` : `${p.totalOriginal.toFixed(2)} ${p.currency}`}
                    </div>
                    {p.currency !== 'USD' && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        eq. ${p.totalUsd.toFixed(2)} USD
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Formulario de Arqueo y Cierre */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, fontWeight: 800, color: '#e11d48' }}>Realizar Arqueo y Cierre de Caja</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Ingresa el total contado físicamente en efectivo para verificar descuadres con el sistema.
            </p>

            <form onSubmit={handleCloseRegister}>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Total Físico Contado (Efectivo USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder={summary?.expectedTotalUsd?.toFixed(2)}
                  value={closingAmountUsd}
                  onChange={(e) => setClosingAmountUsd(e.target.value)}
                  required
                />
              </div>

              {closingAmountUsd !== '' && (
                <div
                  style={{
                    margin: '1rem 0',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background:
                      parseFloat(closingAmountUsd) - (summary?.expectedTotalUsd || 0) === 0
                        ? '#ecfdf5'
                        : '#fff1f2',
                    border:
                      parseFloat(closingAmountUsd) - (summary?.expectedTotalUsd || 0) === 0
                        ? '1px solid #a7f3d0'
                        : '1px solid #fecdd3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  {parseFloat(closingAmountUsd) - (summary?.expectedTotalUsd || 0) === 0 ? (
                    <CheckCircle2 size={20} color="#059669" />
                  ) : (
                    <ShieldAlert size={20} color="#e11d48" />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>
                      Diferencia / Descuadre:{' '}
                      {(parseFloat(closingAmountUsd) - (summary?.expectedTotalUsd || 0)).toFixed(2)} USD
                    </div>
                    <span style={{ fontSize: '0.775rem' }}>
                      {parseFloat(closingAmountUsd) - (summary?.expectedTotalUsd || 0) === 0
                        ? 'Caja cuadrada perfectamente.'
                        : 'Existe una diferencia entre el efectivo contado y el registrado.'}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Observaciones de Cierre</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="ej. Arqueo completado sin novedad"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  className="btn-save"
                  style={{ width: '100%', background: 'linear-gradient(135deg, #f43f5e, #e11d48)' }}
                  disabled={isSubmitting}
                >
                  <Lock size={18} />
                  <span>{isSubmitting ? 'Cerrando Caja...' : 'Cerrar Turno y Emitir Reporte Z'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
