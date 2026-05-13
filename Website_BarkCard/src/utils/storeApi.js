const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const resolveApiBaseUrls = () => {
  const urls = [API_BASE_URL];
  if (API_BASE_URL.includes('localhost')) {
    urls.push(API_BASE_URL.replace('localhost', '127.0.0.1'));
  }
  return [...new Set(urls)];
};

const postJson = async (path, body) => {
  let lastFetchError = null;

  for (const baseUrl of resolveApiBaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          ...payload
        };
      }

      return {
        success: true,
        ...payload
      };
    } catch (error) {
      lastFetchError = error;
    }
  }

  return {
    success: false,
    reason: 'server_unreachable',
    message: lastFetchError?.message || 'Unable to reach backend server.'
  };
};

const getJson = async (path) => {
  let lastFetchError = null;

  for (const baseUrl of resolveApiBaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          ...payload
        };
      }

      return {
        success: true,
        ...payload
      };
    } catch (error) {
      lastFetchError = error;
    }
  }

  return {
    success: false,
    reason: 'server_unreachable',
    message: lastFetchError?.message || 'Unable to reach backend server.'
  };
};

export const createStore = async (storePayload) => {
  const result = await postJson('/api/stores', storePayload);

  if (!result.success) {
    throw new Error(result.message || 'Failed to create store.');
  }

  return result.store;
};

export const fetchStores = async () => {
  const result = await getJson('/api/stores');

  if (!result.success) {
    throw new Error(result.message || 'Failed to load stores.');
  }

  return result.stores || [];
};
