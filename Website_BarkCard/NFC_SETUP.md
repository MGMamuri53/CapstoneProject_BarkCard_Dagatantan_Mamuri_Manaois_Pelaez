# CardLink Admin - NFC Setup Guide

## Overview

This admin panel uses an **ACR122U NFC Reader** to assign physical NFC cards to user accounts.

## Complete Startup Procedure

### Terminal 1: Start NFC Server
```bash
cd nfc-server
npm install    # First time only
npm start
```

Wait for confirmation:
```
NFC Server running on http://localhost:3001
Waiting for ACR122U reader...
Reader detected: ACS ACR122 0
```

### Terminal 2: Start Admin Website
```bash
npm install    # First time only
npm run dev
# or
npm run build  # then serve
```

The website opens on your configured dev server (usually `http://localhost:5173` or similar).

---

## Using the NFC Feature

### To Assign an NFC Card to a User:

1. **Select a user** from the list
2. Click **"💳 Assign NFC ID"** button
3. A modal appears: "Tap card on the ACR122U reader…"
4. **Tap a card/tag** on the physical reader
5. The card UID is captured and saved to database

### Success Response:
- Modal closes
- Toast notification: `Success! NFC AA:BB:CC:DD:EE assigned to John Doe`

### Error Responses:
| Error | Cause |
|-------|-------|
| `"Server offline. Ensure nfc-server is running on port 3001."` | NFC server not running |
| `"No NFC ID detected."` | Reader not connected or card not detected |
| `"Reader not found"` | ACR122U disconnected or no drivers |
| `"Select a user first"` | No user selected from list |

---

## System Status Checks

### Verify Smart Card Service (Windows)
```powershell
Get-Service SCardSvr | Select-Object Status, StartType
```
**Should show:** `Status: Running, StartType: Automatic`

### Verify ACR122U Recognition
```powershell
Get-PnpDevice | Where-Object { $_.Name -like "*ACR*" }
```
**Should show:** `ACS ACR122 0` with Status `OK`

### Verify Port 3001 is Free
```powershell
Get-NetTcpConnection -LocalPort 3001 -ErrorAction SilentlyContinue
```
**If no output:** Port is free (good!)

---

## Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| Server starts but no reader detected | Unplug ACR122U, wait 5 seconds, plug back in |
| Website cannot reach server | Ensure nfc-server terminal is running; check firewall |
| NFC assignment times out | Reader not responding; try replugging USB |
| "Another app is using the reader" | Close other NFC apps (PC/SC readers) or restart service |

---

## Architecture

```
┌─────────────────────────────────────┐
│   Website (React/TypeScript)        │
│   - UserManagement component        │
│   - Calls: http://localhost:3001    │
└────────────────────┬────────────────┘
                     │ HTTP (CORS enabled)
                     ▼
┌─────────────────────────────────────┐
│   NFC Server (Node.js/Express)      │
│   - /api/nfc/wait endpoint          │
│   - Polls ACR122U via PC/SC         │
└────────────────────┬────────────────┘
                     │ PC/SC Interface
                     ▼
┌─────────────────────────────────────┐
│   ACR122U NFC Reader (USB)          │
│   - Windows Smart Card Service      │
└─────────────────────────────────────┘
         ▲
         │ (Tap NFC card here)
         │
      ┌──┴─────────────────┐
      │   Physical Card    │
      │   (NFC/RFID tag)   │
      └────────────────────┘
```

---

## Files Changed

| File | Change |
|------|--------|
| `nfc-server/package.json` | Added `start` and `dev` scripts, `nodemon` dependency |
| `src/components/UserManagement.tsx` | Removed WebUSB, added nfc-server API calls |
| `nfc-server/README.md` | Detailed server documentation |

---

## Key Configuration

- **NFC Server Port:** `3001`
- **Frontend Port:** `5173` (or configured dev server)
- **API Timeout:** 30 seconds (poll interval: 500ms)
- **Card Format:** Hex string with colons (e.g., `AA:BB:CC:DD:EE`)

---

## Support

For detailed API documentation, see [nfc-server/README.md](nfc-server/README.md)
