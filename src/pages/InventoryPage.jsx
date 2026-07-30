import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProductsAPI,
  createProductAPI,
  getCategoriesAPI,
  createCategoryAPI,
  getSuppliersAPI,
  archiveVariantAPI,
} from '../services/inventoryService';
import { ProductModal } from '../components/ProductModal';
import { CategoryModal } from '../components/CategoryModal';
import { Search, Plus, Filter, AlertTriangle, PackageCheck, Archive, Tag } from 'lucide-react';
import './InventoryPage.css';

export function InventoryPage() {
  const { token } = useAuth();
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [error, setError] = useState(null);

  // Modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodsData, catsData, suppsData] = await Promise.all([
        getProductsAPI(token, search, selectedCategory, lowStockOnly),
        getCategoriesAPI(token),
        getSuppliersAPI(token),
      ]);
      setVariants(prodsData);
      setCategories(catsData);
      setSuppliers(suppsData);
    } catch (err) {
      setError(err.message || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  }, [token, search, selectedCategory, lowStockOnly]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleCreateProduct = async (productData) => {
    await createProductAPI(token, productData);
    await loadInventory();
  };

  const handleCreateCategory = async (name) => {
    await createCategoryAPI(token, name);
    await loadInventory();
  };

  const handleArchiveVariant = async (variantId) => {
    if (window.confirm('¿Deseas archivar esta variante de producto?')) {
      try {
        await archiveVariantAPI(token, variantId);
        await loadInventory();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="inventory-container">
      {/* Control & Filter Actions Bar */}
      <div className="inventory-actions-bar">
        <div className="filter-group">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="inventory-search-input"
              placeholder="Buscar SKU, producto o atributo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="input-icon" size={18} />
          </div>

          <select
            className="select-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c._count?.products || 0})
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`btn-filter-toggle ${lowStockOnly ? 'active' : ''}`}
            onClick={() => setLowStockOnly(!lowStockOnly)}
          >
            <AlertTriangle size={16} />
            <span>Bajo Stock</span>
          </button>
        </div>

        <div className="action-buttons-group">
          <button onClick={() => setShowCategoryModal(true)} className="btn-action-secondary">
            <Tag size={16} />
            <span>Nueva Categoría</span>
          </button>
          <button onClick={() => setShowProductModal(true)} className="btn-action-primary">
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="login-error-alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Modern Inventory Table */}
      <div className="table-card">
        <div className="table-responsive">
          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto 1rem auto', width: '32px', height: '32px' }}></div>
              <p>Sincronizando catálogo con Supabase...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="empty-state">
              <PackageCheck size={52} className="empty-state-icon" />
              <h4>No se encontraron productos</h4>
              <p>Intenta ajustar los criterios de búsqueda o registra tu primer producto.</p>
            </div>
          ) : (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto / Variante</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Costo (USD)</th>
                  <th>Precio Venta</th>
                  <th>Estado Stock</th>
                  <th>Atributos</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const isOut = v.stock === 0;
                  const isLow = v.stock > 0 && v.stock <= 5;
                  return (
                    <tr key={v.id}>
                      <td>
                        <span className="sku-badge">{v.sku}</span>
                      </td>
                      <td>
                        <div className="product-name-title">{v.variantName || v.product?.baseName}</div>
                        {v.product?.baseName && v.product?.baseName !== v.variantName && (
                          <div className="product-name-sub">{v.product?.baseName}</div>
                        )}
                      </td>
                      <td>{v.product?.category?.name || 'Sin Categoría'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{v.product?.supplier?.name || 'N/A'}</td>
                      <td>
                        <span className="cost-tag">${Number(v.costUsd).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className="price-tag">${Number(v.priceUsd).toFixed(2)}</span>
                      </td>
                      <td>
                        <span className={`stock-pill ${isOut ? 'out' : isLow ? 'low' : 'optimal'}`}>
                          <span className="stock-dot"></span>
                          <span>{isOut ? 'Agotado' : isLow ? `Bajo (${v.stock})` : `${v.stock} un.`}</span>
                        </span>
                      </td>
                      <td>
                        {v.attributes && typeof v.attributes === 'object' && Object.keys(v.attributes).length > 0 ? (
                          Object.entries(v.attributes).map(([key, val]) => (
                            <span key={key} className="attribute-pill">
                              <span className="attribute-key">{key}:</span> {val}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleArchiveVariant(v.id)}
                          className="btn-icon-action"
                          title="Archivar Variante"
                        >
                          <Archive size={16} />
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

      {/* Modales */}
      {showProductModal && (
        <ProductModal
          categories={categories}
          suppliers={suppliers}
          onClose={() => setShowProductModal(false)}
          onSave={handleCreateProduct}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          onClose={() => setShowCategoryModal(false)}
          onSave={handleCreateCategory}
        />
      )}
    </div>
  );
}
