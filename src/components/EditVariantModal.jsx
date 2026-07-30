import { useState, useEffect } from 'react';
import { X, Edit3, Save, AlertCircle } from 'lucide-react';
import './EditVariantModal.css';

export function EditVariantModal({ variant, onClose, onSave }) {
  const [variantName, setVariantName] = useState('');
  const [sku, setSku] = useState('');
  const [costUsd, setCostUsd] = useState('');
  const [priceUsd, setPriceUsd] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (variant) {
      setVariantName(variant.variantName || variant.product?.baseName || '');
      setSku(variant.sku || '');
      setCostUsd(variant.costUsd ? Number(variant.costUsd).toString() : '');
      setPriceUsd(variant.priceUsd ? Number(variant.priceUsd).toString() : '');
      setStock(variant.stock !== undefined ? variant.stock.toString() : '');
    }
  }, [variant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!variantName.trim() || !sku.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(variant.id, {
        variantName: variantName.trim(),
        sku: sku.trim(),
        costUsd: parseFloat(costUsd) || 0,
        priceUsd: parseFloat(priceUsd) || 0,
        stock: parseInt(stock, 10) || 0,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-variant-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={20} color="var(--accent-gold)" />
            <h2 style={{ margin: 0 }}>Editar Producto / Variante</h2>
          </div>
          <button onClick={onClose} className="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="login-error-alert" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre del Producto / Variante *</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Código SKU Único *</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="form-grid-3" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Existencias (Stock) *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Costo (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={costUsd}
                onChange={(e) => setCostUsd(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio Venta (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              <Save size={16} />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
