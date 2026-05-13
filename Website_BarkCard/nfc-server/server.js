const { NFC } = require('nfc-pcsc');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let currentCard = null;
let cardReaders = [];
let lastError = null;

// Function to normalize card ID
const normalizeCardId = (uid) => {
  return Buffer.from(uid)
    .toString('hex')
    .toLowerCase()
    .match(/.{1,2}/g)
    .join(':');
};

const nfc = new NFC();

nfc.on('reader', reader => {
  console.log(`${new Date().toISOString()} - Reader detected:`, reader.reader.name);
  
  // Store reader for monitoring
  cardReaders.push(reader);
  console.log(`Active readers: ${cardReaders.length}`);

  reader.on('card', card => {
    const normalizedUid = normalizeCardId(card.uid);
    console.log(`${new Date().toISOString()} - Card detected:`, {
      raw: card.uid,
      normalized: normalizedUid,
      standard: card.standard,
      type: card.type
    });

    currentCard = {
      uid: normalizedUid,
      raw: card.uid,
      atr: card.atr?.toString('hex'),
      standard: card.standard,
      type: card.type,
      timestamp: Date.now()
    };
  });

  reader.on('card.off', card => {
    console.log('Card removed');
    currentCard = null;
  });

  reader.on('error', err => {
    console.error('Reader error:', err);
  });
});

nfc.on('error', err => {
  console.error('NFC error:', err);
});

// API endpoint to check for card
app.get('/api/nfc/read', (req, res) => {
  if (currentCard) {
    res.json({
      success: true,
      card: currentCard
    });
  } else {
    res.json({
      success: false,
      message: 'No card detected'
    });
  }
});

// API endpoint to wait for card tap
app.get('/api/nfc/wait', async (req, res) => {
  // Poll for card every 500ms for up to 30 seconds
  const maxAttempts = 60;
  let attempts = 0;

  const checkCard = () => {
    if (currentCard) {
      res.json({
        success: true,
        card: currentCard
      });
    } else if (attempts >= maxAttempts) {
      res.json({
        success: false,
        message: 'Timeout waiting for card'
      });
    } else {
      attempts++;
      setTimeout(checkCard, 500);
    }
  };

  checkCard();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`NFC Server running on http://localhost:${PORT}`);
  console.log('Waiting for ACR122U reader...');
});