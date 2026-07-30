import { useState } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import './ProductModal.css';

export function ProductModal({ categories, suppliers, onClose, onSave }) {
  const [baseName, setBaseName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [variants, setVariants] = useState([
    {
      variantName: '',
      sku: '',
      costUsd: 0,
      priceUsd: 0,
      stock: 10,
      talla: '',
      color: '',
    },
  ]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        variantName: '',
        sku: '',
        costUsd: 0,
        priceUsd: 0,
        stock: 10,
        talla: '',
        color: '',
      },
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!baseName.trim()) {
      setError('El nombre base del producto es requerido');
      return;
    }

    // Validar variantes
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.sku.trim()) {
        setError(`El SKU de la variante #${i + 1} es requerido`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const productPayload = {
        baseName,
        description,
        categoryId: categoryId || undefined,
        supplierId: supplierId || undefined,
        variants: variants.map((v) => ({
          variantName: v.variantName || `${baseName} (${v.sku})`,
          sku: v.sku.trim(),
          costUsd: parseFloat(v.costUsd) || 0,
          priceUsd: parseFloat(v.priceUsd) || 0,
          stock: parseInt(v.stock, 10) || 0,
          imageUrl: v.imageUrl?.trim() || undefined,
          attributes: {
            ...(v.talla ? { talla: v.talla } : {}),
            ...(v.color ? { color: v.color } : {}),
          },
        })),
      };

      await onSave(productPayload);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Nuevo Producto & Inventario</h2>
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
            <label className="form-label">Nombre del Producto Base *</label>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '1rem' }}
              placeholder="ej. Franela Oversize Giogreys"
              value={baseName}
              onChange={(e) => setBaseName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Descripción</label>
            <textarea
              className="form-input"
              style={{ paddingLeft: '1rem', minHeight: '60px', resize: 'vertical' }}
              placeholder="Detalles de materiales o especificaciones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-grid-2" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Seleccionar Categoría...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Proveedor</label>
              <select
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Seleccionar Proveedor...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Variantes de Producto (SKU & Stock)</span>
            <button
              type="button"
              className="btn-submit"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', width: 'auto', margin: 0 }}
              onClick={handleAddVariant}
            >
              <Plus size={16} />
              <span>Agregar Variante</span>
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="variant-card-editor">
              <div className="variant-header">
                <span>Variante #{index + 1}</span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">SKU Único *</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="ej. GIO-TSHIRT-M"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Costo en USD ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={variant.costUsd}
                    onChange={(e) => handleVariantChange(index, 'costUsd', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Precio Venta USD ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={variant.priceUsd}
                    onChange={(e) => handleVariantChange(index, 'priceUsd', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.85rem' }}>
                <label className="form-label">URL de Imagen (Opcional)</label>
                <input
                  type="url"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={variant.imageUrl || ''}
                  onChange={(e) => handleVariantChange(index, 'imageUrl', e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Talla (Atributo)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="ej. S, M, L, 42"
                    value={variant.talla}
                    onChange={(e) => handleVariantChange(index, 'talla', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color (Atributo)</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="ej. Negro, Blanco, Azul"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
