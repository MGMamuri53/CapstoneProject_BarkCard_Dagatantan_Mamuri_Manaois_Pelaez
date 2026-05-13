/**
 * NFC Helper - Communicates with the NFC server running on port 3001
 */

const NFC_SERVER_URL = 'http://localhost:3001/api/nfc';

/**
 * Wait for a card tap with a timeout
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000 = 30 seconds)
 * @returns {Promise<{success: boolean, card?: object, message?: string}>}
 */
export const waitForCardTap = async (timeoutMs = 30000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${NFC_SERVER_URL}/wait`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'No NFC card detected (timeout)'
      };
    }
    return {
      success: false,
      message: `NFC error: ${error.message}`
    };
  }
};

/**
 * Check current card status
 * @returns {Promise<{success: boolean, card?: object, message?: string}>}
 */
export const checkCurrentCard = async () => {
  try {
    const response = await fetch(`${NFC_SERVER_URL}/read`);
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: `Failed to check card: ${error.message}`
    };
  }
};

/**
 * Extract and format the NFC ID from card data
 * @param {object} card - Card object from NFC reader
 * @returns {string} - Formatted NFC ID
 */
export const extractNFCId = (card) => {
  if (!card) return null;
  
  // Use the normalized UID (colon-separated hex format)
  // e.g., "04:d2:5a:42:62:33:80" 
  return card.uid || null;
};

/**
 * Format card info for logging/debugging
 * @param {object} card - Card object from NFC reader
 * @returns {object} - Formatted card info
 */
export const formatCardInfo = (card) => {
  if (!card) return null;

  return {
    nfcId: card.uid,
    standard: card.standard || 'Unknown',
    type: card.type || 'Unknown',
    timestamp: new Date(card.timestamp).toLocaleString()
  };
};
