const API_BASE_URL = '/api';

function getAuthHeader(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getCustomersAPI(token, search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await fetch(`${API_BASE_URL}/customers${query}`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener clientes');
  }
  return data;
}

export async function createCustomerAPI(token, customerData) {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify(customerData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear cliente');
  }
  return data;
}

export async function getCurrenciesAPI(token) {
  const response = await fetch(`${API_BASE_URL}/currencies`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener tasas de cambio');
  }
  return data;
}

export async function getPaymentMethodsAPI(token) {
  const response = await fetch(`${API_BASE_URL}/currencies/payment-methods`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener métodos de pago');
  }
  return data;
}

export async function processSaleAPI(token, saleData) {
  const response = await fetch(`${API_BASE_URL}/sales`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify(saleData),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(errorMsg || 'Error al procesar la venta');
  }
  return data;
}

export async function getSalesHistoryAPI(token) {
  const response = await fetch(`${API_BASE_URL}/sales`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener historial de ventas');
  }
  return data;
}
