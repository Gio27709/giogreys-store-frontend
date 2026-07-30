import { useState } from 'react';
import { X, CheckCircle, DollarSign, Printer, AlertCircle } from 'lucide-react';
import './CheckoutModal.css';

export function CheckoutModal({ totalUsd, rateVes, rateCop, paymentMethods, onClose, onConfirmSale }) {
  const [selectedMethodId, setSelectedMethodId] = useState(paymentMethods[0]?.id || '');
  const [paidAmount, setPaidAmount] = useState(totalUsd);
  const [paymentsList, setPaymentsList] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  const totalVes = (totalUsd * rateVes).toFixed(2);
  const totalCop = (totalUsd * rateCop).toFixed(0);

  const handleAddPayment = () => {
    if (!paidAmount || parseFloat(paidAmount) <= 0) return;
    const method = paymentMethods.find((m) => m.id === selectedMethodId);
    if (!method) return;

    const code = method.defaultCurrency || 'USD';
    let rate = 1.0;
    if (code === 'VES') rate = rateVes;
    if (code === 'COP') rate = rateCop;

    setPaymentsList([
      ...paymentsList,
      {
        paymentMethodId: method.id,
        methodName: method.name,
        amount: parseFloat(paidAmount),
        currencyCode: code,
        exchangeRate: rate,
      },
    ]);
  };

  const handleRemovePayment = (index) => {
    setPaymentsList(paymentsList.filter((_, i) => i !== index));
  };

  const handleFinalize = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Si no ha añadido pagos explícitos a la lista, usar el método seleccionado por defecto
      let finalPayments = paymentsList;
      if (finalPayments.length === 0) {
        const method = paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];
        const code = method.defaultCurrency || 'USD';
        let rate = 1.0;
        if (code === 'VES') rate = rateVes;
        if (code === 'COP') rate = rateCop;

        const defaultAmt = code === 'VES' ? totalUsd * rateVes : code === 'COP' ? totalUsd * rateCop : totalUsd;

        finalPayments = [
          {
            paymentMethodId: method.id,
            amount: defaultAmt,
            currencyCode: code,
            exchangeRate: rate,
          },
        ];
      }

      const result = await onConfirmSale(finalPayments);
      setCompletedSale(result);
    } catch (err) {
      setError(err.message || 'Error al procesar cobro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="checkout-modal-content">
        <div className="modal-header">
          <h2>Procesar Cobro POS</h2>
          <button onClick={onClose} className="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        {completedSale ? (
          <div className="receipt-success-card">
            <div className="receipt-icon">
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0', color: '#1e1b18' }}>¡Venta Completada!</h3>
            <p style={{ color: '#78716c', margin: '0 0 1.5rem 0' }}>
              Factura N°: <strong style={{ color: '#d97706' }}>{completedSale.saleNumber || 'INV-COMPLETED'}</strong>
            </p>

            <div className="totals-summary-card" style={{ textAlign: 'left' }}>
              <div className="total-row-main">
                <span>Total Facturado:</span>
                <span className="total-usd-amount">${Number(completedSale.totalUsd).toFixed(2)}</span>
              </div>
              <div className="currencies-breakdown">
                <div className="currency-pill">
                  <span>VES:</span>
                  <strong>Bs. {(Number(completedSale.totalUsd) * rateVes).toFixed(2)}</strong>
                </div>
                <div className="currency-pill">
                  <span>COP:</span>
                  <strong>$ {(Number(completedSale.totalUsd) * rateCop).toFixed(0)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button onClick={() => window.print()} className="btn-action-secondary">
                <Printer size={18} />
                <span>Imprimir Ticket</span>
              </button>
              <button onClick={onClose} className="btn-action-primary">
                Nueva Venta
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="login-error-alert" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="totals-summary-card">
              <div className="total-row-main">
                <span style={{ fontWeight: 600, color: '#57534e' }}>Total a Cobrar:</span>
                <span className="total-usd-amount">${totalUsd.toFixed(2)}</span>
              </div>
              <div className="currencies-breakdown">
                <div className="currency-pill">
                  <span>Bolívares (VES):</span>
                  <strong>Bs. {totalVes}</strong>
                </div>
                <div className="currency-pill">
                  <span>Pesos (COP):</span>
                  <strong>$ {totalCop}</strong>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Método de Pago Principal *</label>
              <select
                className="form-input"
                style={{ paddingLeft: '1rem' }}
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.defaultCurrency})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinalize}
                className="btn-save"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : `Confirmar Cobro ($${totalUsd.toFixed(2)})`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
