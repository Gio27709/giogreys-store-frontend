import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSalesHistoryAPI } from '../services/posService';
import { Search, Receipt, Printer, Eye, X, CheckCircle } from 'lucide-react';
import './SalesHistoryPage.css';

export function SalesHistoryPage() {
  const { token } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSalesHistoryAPI(token);
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredSales = sales.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (s.saleNumber && s.saleNumber.toLowerCase().includes(term)) ||
      (s.customer?.fullName && s.customer.fullName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="sales-history-container">
      <div className="inventory-actions-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="inventory-search-input"
            placeholder="Buscar por N° Factura (ej. INV-10001) o Cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="input-icon" size={18} />
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
              <p>Cargando historial de facturas...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="empty-state">
              <Receipt size={48} />
              <h4>No hay facturas registradas</h4>
              <p>Las ventas procesadas en el POS aparecerán registradas aquí.</p>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>N° Factura</th>
                  <th>Fecha & Hora</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Total Facturado</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((s) => {
                  const dateStr = new Date(s.createdAt).toLocaleString();
                  return (
                    <tr key={s.id}>
                      <td>
                        <span className="sku-badge">{s.saleNumber || 'INV-FACTURA'}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{dateStr}</td>
                      <td style={{ fontWeight: 700 }}>{s.customer?.fullName || 'Cliente General'}</td>
                      <td>{s.seller?.username || 'Vendedor'}</td>
                      <td>
                        <span className="price-tag">${Number(s.totalUsd).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className="stock-pill optimal">
                          <span className="stock-dot"></span>
                          <span>Completada</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedSale(s)}
                          className="btn-action-secondary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <Eye size={14} />
                          <span>Ver Recibo</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Detalle de Recibo / Ticket */}
      {selectedSale && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2>Detalle de Factura {selectedSale.saleNumber}</h2>
              <button onClick={() => setSelectedSale(null)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cliente:</span>
                <strong>{selectedSale.customer?.fullName || 'Cliente General'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vendedor:</span>
                <strong>{selectedSale.seller?.username || 'Admin'}</strong>
              </div>

              <div className="modal-section-title">Ítems Comprados</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {selectedSale.items?.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      background: '#fff8fa',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #fbcfe8',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                        {item.variant?.variantName || item.variant?.product?.baseName}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        {item.quantity} x ${Number(item.unitPriceUsd).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#059669' }}>
                      ${(item.quantity * Number(item.unitPriceUsd)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="totals-summary-card">
                <div className="total-row-main">
                  <span>Total Facturado:</span>
                  <span className="total-usd-amount">${Number(selectedSale.totalUsd).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => window.print()} className="btn-action-secondary">
                <Printer size={16} />
                <span>Imprimir Ticket</span>
              </button>
              <button onClick={() => setSelectedSale(null)} className="btn-action-primary">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
