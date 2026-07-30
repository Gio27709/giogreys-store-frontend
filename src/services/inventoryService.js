const API_BASE_URL = '/api';

function getAuthHeader(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// PRODUCTOS & VARIANTES
export async function getProductsAPI(token, search = '', categoryId = '', lowStockOnly = false) {
  const query = new URLSearchParams();
  if (search) query.append('search', search);
  if (categoryId) query.append('categoryId', categoryId);
  if (lowStockOnly) query.append('lowStock', 'true');

  const response = await fetch(`${API_BASE_URL}/products?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener productos');
  }
  return data;
}

export async function createProductAPI(token, productData) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify(productData),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(errorMsg || 'Error al crear producto');
  }
  return data;
}

export async function updateVariantAPI(token, variantId, variantData) {
  const response = await fetch(`${API_BASE_URL}/products/variants/${variantId}`, {
    method: 'PATCH',
    headers: getAuthHeader(token),
    body: JSON.stringify(variantData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar variante');
  }
  return data;
}

export async function archiveVariantAPI(token, variantId) {
  const response = await fetch(`${API_BASE_URL}/products/variants/${variantId}`, {
    method: 'DELETE',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al archivar variante');
  }
  return data;
}

// CATEGORÍAS
export async function getCategoriesAPI(token) {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener categorías');
  }
  return data;
}

export async function createCategoryAPI(token, name) {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify({ name }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear categoría');
  }
  return data;
}

// PROVEEDORES
export async function getSuppliersAPI(token) {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: 'GET',
    headers: getAuthHeader(token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener proveedores');
  }
  return data;
}

export async function createSupplierAPI(token, supplierData) {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: 'POST',
    headers: getAuthHeader(token),
    body: JSON.stringify(supplierData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al crear proveedor');
  }
  return data;
}
