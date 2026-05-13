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
      try {
        console.debug('[postJson] POST ->', `${baseUrl}${path}`, body);
      } catch (e) {
        console.debug('[postJson] POST ->', `${baseUrl}${path}`);
      }
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
    message: lastFetchError?.message || 'Unable to reach authentication server.'
  };
};

export const storePasswordHash = async (userId, plainPassword) => {
  const result = await postJson('/api/auth/store-password', {
    userId,
    password: plainPassword
  });

  if (!result.success) {
    throw new Error(result.message || 'Password storage failed');
  }

  return result;
};

export const updatePasswordHash = async (userId, plainPassword) => {
  return storePasswordHash(userId, plainPassword);
};

export const verifyUserCredentials = async (email, plainPassword) => {
  const result = await postJson('/api/auth/login', {
    email,
    password: plainPassword
  });

  if (!result.success) {
    return {
      ok: false,
      reason: result.reason || 'invalid_credentials',
      message: result.message || 'Invalid email or password.'
    };
  }

  return {
    ok: true,
    reason: 'valid',
    user: result.user
  };
};

export const migratePasswordsToHash = async () => {
  const result = await postJson('/api/auth/migrate-passwords', {});

  if (!result.success) {
    throw new Error(result.message || 'Password migration failed');
  }

  return result;
};
