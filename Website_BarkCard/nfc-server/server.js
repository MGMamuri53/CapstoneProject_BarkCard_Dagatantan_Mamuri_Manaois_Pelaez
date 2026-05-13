require('dotenv').config();
const { NFC } = require('nfc-pcsc');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
} else {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for backend auth routes.');
}

let currentCard = null;
let cardReaders = [];

const normalizeCardId = (uid) => {
  return Buffer.from(uid)
    .toString('hex')
    .toLowerCase()
    .match(/.{1,2}/g)
    .join(':');
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizeRole = (value) => {
  const normalized = String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '');

  if (normalized === 'superadmin' || normalized === 'superadministrator') {
    return 'SuperAdmin';
  }

  if (normalized === 'owner') {
    return 'Owner';
  }

  if (normalized === 'staff') {
    return 'Staff';
  }

  if (normalized === 'student') {
    return 'Student';
  }

  return value || null;
};

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$.{53}$/.test(String(value || ''));

const ensureAdminClient = (res) => {
  if (!supabaseAdmin) {
    res.status(500).json({
      success: false,
      message: 'Supabase service role configuration is missing on the server.'
    });
    return false;
  }

  return true;
};

const hashAndStorePassword = async (userId, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabaseAdmin
    .from('tbl_usercredentials')
    .upsert(
      {
        uv_id: userId,
        ucv_passwordhash: hashedPassword,
        ucv_updatedat: new Date().toISOString()
      },
      { onConflict: 'uv_id' }
    )
    .select();

  if (error) {
    throw error;
  }

  return data;
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

app.get('/api/auth/health', (req, res) => {
  res.json({
    success: true,
    configured: Boolean(supabaseAdmin)
  });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    if (!ensureAdminClient(res)) return;

    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        reason: 'invalid_request',
        message: 'Email and password are required.'
      });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('tbl_user')
      .select('uv_id, uv_email, uv_role, uv_firstname, uv_lastname')
      .ilike('uv_email', email)
      .maybeSingle();

    if (userError) {
      console.error('[auth/login] Error fetching user:', userError);
      return res.status(500).json({
        success: false,
        reason: 'user_fetch_error',
        message: 'Unable to read user data.'
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        reason: 'invalid_credentials',
        message: 'Invalid email or password.'
      });
    }

    const { data: credentials, error: credentialsError } = await supabaseAdmin
      .from('tbl_usercredentials')
      .select('ucv_passwordhash, ucv_updatedat')
      .eq('uv_id', user.uv_id)
      .maybeSingle();

    if (credentialsError) {
      console.error('[auth/login] Error fetching credentials:', credentialsError);
      return res.status(500).json({
        success: false,
        reason: 'credential_fetch_error',
        message: 'Unable to read credentials.'
      });
    }

    if (!credentials?.ucv_passwordhash) {
      return res.status(401).json({
        success: false,
        reason: 'missing_credentials',
        message: 'No password record exists for this user.'
      });
    }

    const storedPassword = String(credentials.ucv_passwordhash);
    let passwordMatches = false;

    if (isBcryptHash(storedPassword)) {
      passwordMatches = await bcrypt.compare(password, storedPassword);
    } else {
      passwordMatches = storedPassword === password;

      if (passwordMatches) {
        await hashAndStorePassword(user.uv_id, password);
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        reason: 'invalid_credentials',
        message: 'Invalid email or password.'
      });
    }

    const role = normalizeRole(user.uv_role);
    const fullName = `${user.uv_lastname || ''} ${user.uv_firstname || ''}`.trim();

    return res.json({
      success: true,
      user: {
        userId: user.uv_id,
        email: String(user.uv_email || email),
        role,
        fullName
      }
    });
  } catch (error) {
    console.error('[auth/login] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      reason: 'server_error',
      message: 'Unable to validate credentials right now.'
    });
  }
});

app.post('/api/auth/store-password', async (req, res) => {
  try {
    if (!ensureAdminClient(res)) return;

    const userId = String(req.body?.userId || '').trim();
    const password = String(req.body?.password || '');

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: 'userId and password are required.'
      });
    }

    const data = await hashAndStorePassword(userId, password);

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[auth/store-password] Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to store password.'
    });
  }
});

app.post('/api/auth/migrate-passwords', async (req, res) => {
  try {
    if (!ensureAdminClient(res)) return;

    const { data: credentials, error } = await supabaseAdmin
      .from('tbl_usercredentials')
      .select('ucv_id, uv_id, ucv_passwordhash');

    if (error) {
      console.error('[auth/migrate-passwords] Error fetching credentials:', error);
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch credentials.'
      });
    }

    const results = {
      total: credentials?.length || 0,
      migrated: 0,
      alreadyHashed: 0,
      errors: []
    };

    for (const credential of credentials || []) {
      try {
        const passwordValue = String(credential.ucv_passwordhash || '');

        if (!passwordValue) {
          results.errors.push({ uv_id: credential.uv_id, error: 'Empty password value.' });
          continue;
        }

        if (isBcryptHash(passwordValue)) {
          results.alreadyHashed++;
          continue;
        }

        const hashedPassword = await bcrypt.hash(passwordValue, 10);

        const { error: updateError } = await supabaseAdmin
          .from('tbl_usercredentials')
          .update({
            ucv_passwordhash: hashedPassword,
            ucv_updatedat: new Date().toISOString()
          })
          .eq('ucv_id', credential.ucv_id);

        if (updateError) {
          throw updateError;
        }

        results.migrated++;
      } catch (itemError) {
        console.error('[auth/migrate-passwords] Item error:', itemError);
        results.errors.push({
          uv_id: credential.uv_id,
          error: itemError.message || 'Migration failed.'
        });
      }
    }

    return res.json({
      success: results.errors.length === 0,
      ...results
    });
  } catch (error) {
    console.error('[auth/migrate-passwords] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Password migration failed.'
    });
  }
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
  console.log('Auth endpoints enabled:', Boolean(supabaseAdmin));
});