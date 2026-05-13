const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const migratePasswordsToHash = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/migrate-passwords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Password migration failed');
    }

    return payload;
  } catch (error) {
    console.error('[Migration] Critical error:', error);
    throw error;
  }
};

export default migratePasswordsToHash;
