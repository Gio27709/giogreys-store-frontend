const API_BASE_URL = '/api';

export async function loginAPI(usernameOrEmail, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ usernameOrEmail, password }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Error en el servidor (${response.status}): ${text || 'Sin respuesta del servidor'}`);
    }

    if (!response.ok) {
      const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      throw new Error(errorMsg || 'Credenciales incorrectas');
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export async function getProfileAPI(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Error en el servidor (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'Sesión inválida o expirada');
    }

    return data;
  } catch (err) {
    throw err;
  }
}
