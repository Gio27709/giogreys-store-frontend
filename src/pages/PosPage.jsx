import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductsAPI, getCategoriesAPI } from '../services/inventoryService';
import { getCustomersAPI, createCustomerAPI, getCurrenciesAPI, getPaymentMethodsAPI, processSaleAPI } from '../services/posService';
import { CheckoutModal } from '../components/CheckoutModal';
import { Search, ShoppingBag, Plus, Trash2, CreditCard, UserPlus, X } from 'lucide-react';
import './PosPage.css';

export function PosPage() {
  const { token } = useAuth();
  const [variants, setVariants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);

  // Modal para crear cliente rápido en la caja POS
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustIdNumber, setNewCustIdNumber] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [isSubmittingCust, setIsSubmittingCust] = useState(false);

  // Carrito de Compras POS
  const [cart, setCart] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const loadPosData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodsData, catsData, custsData, currsData, pmsData] = await Promise.all([
        getProductsAPI(token, search, selectedCategory),
        getCategoriesAPI(token),
        getCustomersAPI(token),
        getCurrenciesAPI(token),
        getPaymentMethodsAPI(token),
      ]);
      setVariants(prodsData);
      setCategories(catsData);
      setCustomers(custsData);
      setCurrencies(currsData);
      setPaymentMethods(pmsData);

      setSelectedCustomerId((prev) => {
        if (prev) return prev;
        return custsData.length > 0 ? custsData[0].id : '';
      });
    } catch (err) {
      setError(err.message || 'Error al cargar datos de POS');
    } finally {
      setLoading(false);
    }
  }, [token, search, selectedCategory]);

  useEffect(() => {
    loadPosData();
  }, [loadPosData]);

  // Tasas de cambio
  const rateVes = useMemo(() => {
    const ves = currencies.find((c) => c.currencyCode === 'VES');
    return ves ? Number(ves.rateToUsd) : 36.5;
  }, [currencies]);

  const rateCop = useMemo(() => {
    const cop = currencies.find((c) => c.currencyCode === 'COP');
    return cop ? Number(cop.rateToUsd) : 4000;
  }, [currencies]);

  // Agregar cliente rápido
  const handleQuickCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    try {
      setIsSubmittingCust(true);
      const newCust = await createCustomerAPI(token, {
        fullName: newCustName.trim(),
        idNumber: newCustIdNumber.trim() || undefined,
        phone: newCustPhone.trim() || undefined,
      });

      setShowNewCustomerModal(false);
      setNewCustName('');
      setNewCustIdNumber('');
      setNewCustPhone('');

      const updatedCusts = await getCustomersAPI(token);
      setCustomers(updatedCusts);
      setSelectedCustomerId(newCust.id);
    } catch (err) {
      alert(err.message || 'Error al registrar cliente');
    } finally {
      setIsSubmittingCust(false);
    }
  };

  // Agregar al carrito
  const addToCart = (variant) => {
    if (variant.stock <= 0) return;

    const existingIndex = cart.findIndex((item) => item.variantId === variant.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      if (updated[existingIndex].quantity < variant.stock) {
        updated[existingIndex].quantity += 1;
        setCart(updated);
      }
    } else {
      setCart([
        ...cart,
        {
          variantId: variant.id,
          sku: variant.sku,
          name: variant.variantName || variant.product?.baseName,
          unitPriceUsd: Number(variant.priceUsd),
          quantity: 1,
          maxStock: variant.stock,
        },
      ]);
    }
  };

  const updateQuantity = (variantId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.variantId === variantId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.maxStock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const removeFromCart = (variantId) => {
    setCart((prevCart) => prevCart.filter((item) => item.variantId !== variantId));
  };

  // Totales
  const totalUsd = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPriceUsd * item.quantity, 0);
  }, [cart]);

  const totalVes = (totalUsd * rateVes).toFixed(2);
  const totalCop = (totalUsd * rateCop).toFixed(0);

  const handleConfirmSale = async (paymentsList) => {
    const salePayload = {
      customerId: selectedCustomerId || undefined,
      items: cart.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPriceUsd: item.unitPriceUsd,
      })),
      payments: paymentsList,
    };

    const result = await processSaleAPI(token, salePayload);
    setCart([]);
    await loadPosData();
    return result;
  };

  return (
    <div className="pos-container">
      {/* Sección Izquierda: Catálogo Rápido */}
      <div className="pos-catalog-section">
        <div className="inventory-actions-bar" style={{ padding: '0.85rem 1rem' }}>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="inventory-search-input"
              placeholder="Buscar por SKU o Nombre para agregar a la caja..."
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
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="login-error-alert">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <p>Cargando productos de la caja...</p>
          </div>
        ) : (
          <div className="pos-products-grid">
            {variants.map((v) => {
              const isOut = v.stock === 0;
              return (
                <div
                  key={v.id}
                  className={`pos-product-card ${isOut ? 'out-of-stock' : ''}`}
                  onClick={() => !isOut && addToCart(v)}
                >
                  <div>
                    <span className="pos-card-sku">{v.sku}</span>
                    <div className="pos-card-title">{v.variantName || v.product?.baseName}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="pos-card-price">${Number(v.priceUsd).toFixed(2)}</span>
                    <span className={`stock-pill ${isOut ? 'out' : 'optimal'}`}>
                      {isOut ? 'Agotado' : `${v.stock} un.`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sección Derecha: Carrito POS Lateral */}
      <div className="pos-cart-panel">
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--accent-gold)" />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Caja POS</h3>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
            {cart.length} item(s)
          </span>
        </div>

        <div style={{ padding: '0.75rem 1rem', background: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <label className="form-label" style={{ fontSize: '0.775rem', margin: 0 }}>
              Cliente de la Venta
            </label>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-gold)',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <UserPlus size={14} />
              <span>+ Nuevo</span>
            </button>
          </div>

          <select
            className="select-filter"
            style={{ width: '100%' }}
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} {c.idNumber ? `(${c.idNumber})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p>Haz clic en los productos para agregarlos al carrito de compra.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.variantId} className="cart-item-row">
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                    ${(item.unitPriceUsd * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item.variantId, -1)} className="btn-qty">
                    -
                  </button>
                  <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variantId, 1)} className="btn-qty">
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.variantId)}
                    style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', marginLeft: '0.3rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer-summary">
          <div className="multicurrency-preview">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Bolívares (VES):</span>
              <strong>Bs. {totalVes}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Pesos (COP):</span>
              <strong>$ {totalCop}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total USD:</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>${totalUsd.toFixed(2)}</span>
          </div>

          <button
            onClick={() => setShowCheckoutModal(true)}
            className="btn-checkout"
            disabled={cart.length === 0}
          >
            <CreditCard size={20} />
            <span>Cobrar Venta (${totalUsd.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Modal Rápido de Nuevo Cliente */}
      {showNewCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h2>Registrar Cliente Rápido</h2>
              <button onClick={() => setShowNewCustomerModal(false)} className="btn-close-modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickCreateCustomer}>
              <div className="form-group">
                <label className="form-label">Nombre del Cliente *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="ej. Juan Pérez"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.85rem' }}>
                <label className="form-label">Cédula / RIF</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="V-12345678"
                  value={newCustIdNumber}
                  onChange={(e) => setNewCustIdNumber(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '0.85rem' }}>
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="+58 412-0000000"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowNewCustomerModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-save" disabled={isSubmittingCust}>
                  {isSubmittingCust ? 'Guardando...' : 'Crear y Seleccionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCheckoutModal && (
        <CheckoutModal
          totalUsd={totalUsd}
          rateVes={rateVes}
          rateCop={rateCop}
          paymentMethods={paymentMethods}
          onClose={() => setShowCheckoutModal(false)}
          onConfirmSale={handleConfirmSale}
        />
      )}
    </div>
  );
}
