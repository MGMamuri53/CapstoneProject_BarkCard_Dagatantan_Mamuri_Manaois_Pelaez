# NFC Server - ACR122U Integration

This is a Node.js/Express server that bridges your website to the **ACR122U NFC Reader** using Windows PC/SC interface.

## System Requirements

- **OS:** Windows 10+
- **Hardware:** ACS ACR122U NFC Reader (USB)
- **Service:** Windows Smart Card Service (automatic)
- **Drivers:** ACR122U drivers installed and recognized

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd nfc-server
npm install
```

### Step 2: Start the Server
```bash
npm start
```

**Expected Output:**
```
NFC Server running on http://localhost:3001
Waiting for ACR122U reader...
2026-05-13T10:56:55.499Z - Reader detected: ACS ACR122 0
Active readers: 1
```

### Step 3: Run Your Website
In a separate terminal:
```bash
npm run dev
# or
npm run build
```

The website will connect to the server at `http://localhost:3001` automatically.

---

## Development Mode

For automatic server restarts when you save changes:
```bash
npm run dev
```

This uses **nodemon** to watch for file changes.

---

## API Endpoints

### `GET /api/nfc/read`
Returns the currently detected card UID (if any).

**Response (Card Present):**
```json
{
  "success": true,
  "card": {
    "uid": "AA:BB:CC:DD:EE",
    "raw": "<Buffer>",
    "atr": "3B8F8001...",
    "standard": "ISO-14443A",
    "type": "Mifare",
    "timestamp": 1715605015499
  }
}
```

**Response (No Card):**
```json
{
  "success": false,
  "message": "No card detected"
}
```

### `GET /api/nfc/wait`
Waits for up to **30 seconds** for an NFC card to be tapped. This is what the website uses.

**Response (Card Tapped):**
```json
{
  "success": true,
  "card": { ... }
}
```

**Response (Timeout):**
```json
{
  "success": false,
  "message": "Timeout waiting for card"
}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Error: NFC reader not found"** | Ensure ACR122U is plugged in and recognized in Device Manager (`ACS ACR122 0` should appear) |
| **"Could not claim the ACR122U"** | Another app is using the reader. Restart any existing NFC apps or restart Windows |
| **Server won't start** | Check that port 3001 is not in use: `Get-NetTcpConnection -LocalPort 3001` |
| **Website shows "Server offline"** | Ensure nfc-server is running in another terminal on the same machine |
| **Smart Card Service not running** | Run: `Start-Service SCardSvr` in PowerShell (Admin) |
| **No reader detected on startup** | Try unplugging/replugging the ACR122U or restarting the service |

---

## How It Works

1. **Website calls:** `http://localhost:3001/api/nfc/wait`
2. **Server waits:** Polls the NFC reader via PC/SC interface (max 30 seconds)
3. **Card tapped:** Server reads UID and returns it to website
4. **Website saves:** NFC ID is saved to database (Supabase)

---

## Files

- `server.js` - Main Express server with NFC polling logic
- `package.json` - Dependencies (express, cors, nfc-pcsc)

---

## Notes

- The server polls the reader every **500ms** internally
- Website timeout matches server timeout (~30 seconds)
- All responses are JSON
- CORS is enabled for localhost development
- Reader name format: `ACS ACR122 0` (may vary by system)
