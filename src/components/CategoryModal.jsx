import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import './ProductModal.css';

export function CategoryModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h2>Nueva Categoría</h2>
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
            <label className="form-label">Nombre de Categoría *</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              placeholder="ej. Accesorios & Relojes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
