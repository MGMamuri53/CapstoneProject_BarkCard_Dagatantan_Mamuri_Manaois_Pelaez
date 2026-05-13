# BarkCard Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All unused imports removed
- [x] Debug logging cleaned up (keeping error logs)
- [x] Error handling implemented
- [x] Error boundary configured
- [x] ESLint configuration applied
- [x] Build process tested successfully

### ✅ Environment Configuration
- [x] `.env` file created with Supabase credentials
- [x] `.env` added to `.gitignore` for security
- [x] `.env.example` available for reference
- [x] All required environment variables documented

### ✅ Dependencies
- [x] Updated package.json with all required dependencies
- [x] NFC integration dependencies added
- [x] React 19.2.0 compatibility verified
- [x] Bootstrap 5.3.8 configured

### ✅ Build Optimization
- [x] Code splitting configured in vite.config.js
- [x] Chunk size optimized (600kb limit)
- [x] Production build generates 640kb JS file
- [x] Gzip compression enabled

---

## Installation & Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install NFC server dependencies
cd nfc-server
npm install
cd ..
```

### 2. Configure Environment Variables

Create `.env` file in the root directory:
```
VITE_SUPABASE_URL=https://tkayqwssbnhiddterycx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run Development Server

```bash
# Frontend (runs on http://localhost:5173 by default)
npm run dev

# NFC Server (in another terminal, runs on http://localhost:3001)
cd nfc-server
npm start
```

### 4. Build for Production

```bash
npm run build
```

Output: `dist/` directory with production-ready files

---

## Deployment Steps

### Frontend Deployment (Vite)

**Option A: Static Hosting (Vercel, Netlify, GitHub Pages)**
1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables in platform settings
4. Trigger deployment (auto-deploys on push)

**Option B: Manual Server Deployment**
1. Build locally: `npm run build`
2. Upload `dist/` folder to web server
3. Configure server to serve `index.html` for all routes (SPA routing)
4. Set environment variables on server

### NFC Server Deployment

**Required: Dedicated Server/Computer with NFC Hardware**
1. Install Node.js on the machine with ACR122U NFC reader
2. Copy `nfc-server/` folder
3. Install dependencies: `npm install`
4. Run: `npm start` (or use PM2 for persistence)
5. Ensure it runs on port 3001 and is accessible from frontend

**Production Considerations:**
- Use PM2 or similar to keep process running
- Configure firewall to allow port 3001 access (if remote)
- Monitor server logs for connectivity issues

---

## Database Configuration (Supabase)

### Required Tables
1. **tbl_user** - User accounts
   - `uv_id` (Primary Key)
   - `uv_firstname`, `uv_lastname`, `uv_middlename`
   - `uv_email`
   - `uv_role` (Student, Staff, Owner, SuperAdmin, Hold)
   - `uv_nfcid` ← NFC card ID (newly added)

2. **tbl_student_balance** - User balances
   - `uv_id` (Foreign Key)
   - `sv_balance`

3. **tbl_canteenstore** - Store management
   - `csv_id` (Primary Key)
   - `csv_name`, `csv_location`
   - `csv_manager`, `csv_email`

4. **tbl_storeproduct** - Menu items
5. **tbl_orders** - Order history

### RLS Policies Required
Ensure Row-Level Security policies allow:
- SuperAdmin: Full access to all tables
- Owner: Access to their store data
- Staff/Student: Limited access to their own data

---

## NFC Integration Details

### Hardware
- **Reader**: ACR122U NFC Reader
- **Connection**: USB to computer running NFC server
- **Supported Cards**: ISO14443-A (NFC Forum Type 2 & 4)

### NFC ID Format
Cards are stored in format: `04:d2:5a:42:62:33:80` (colon-separated hex)

### Assignment Process
1. Admin clicks "Assign NFC ID" button
2. 10-second countdown timer starts
3. Card is tapped on reader
4. NFC ID is extracted and saved to `uv_nfcid`
5. Success/error message displayed

### Troubleshooting NFC Issues
- Ensure NFC server is running (`npm start` in `nfc-server/`)
- Verify reader is connected to USB
- Check browser console for connection errors
- Confirm card is compatible (ISO14443-A standard)
- Restart NFC server if reader not detected

---

## Security Checklist

### ✅ Production Security
- [x] Environment variables stored securely (not in code)
- [x] `.env` file in `.gitignore`
- [x] CORS enabled on NFC server (adjust as needed)
- [x] Error messages don't expose sensitive data
- [x] Supabase RLS policies enforced

### 🔒 Additional Recommendations
1. Use HTTPS/SSL for all frontend traffic
2. Implement rate limiting on NFC server
3. Add authentication tokens to NFC server endpoints
4. Monitor Supabase usage for anomalies
5. Regular security audits of dependencies
6. Keep Node.js and npm updated

---

## Performance Monitoring

### Frontend
- Build size: ~640kb JS (gzipped: ~177kb)
- Using code splitting for better caching
- Bootstrap icons: ~180kb WOFF2 fonts

### NFC Server
- Lightweight Express server
- Default 30-second timeout for card detection
- Handles multiple readers automatically

---

## Rollback Procedure

If issues occur after deployment:

1. **Frontend Rollback**
   - Revert to previous `dist/` build
   - Or trigger previous commit deployment

2. **NFC Server Rollback**
   - Stop running server: `Ctrl+C`
   - Restart with previous version
   - No database changes needed

---

## Maintenance

### Regular Tasks
- Monitor error logs in browser console
- Check Supabase usage metrics
- Update dependencies periodically: `npm update`
- Test NFC reader connectivity monthly

### Backup
- Export Supabase database regularly
- Version control all code changes
- Keep `.env.example` updated

---

## Support & Troubleshooting

### Common Issues

**"NFC Server Not Responding"**
- Check if NFC server is running on port 3001
- Verify firewall settings
- Restart NFC server process

**"No Supabase Connection"**
- Verify `.env` variables are correct
- Check internet connectivity
- Verify Supabase project is active

**"NFC Card Not Detected"**
- Ensure reader is plugged in
- Check if card is compatible (ISO14443-A)
- Restart NFC server
- Update nfc-pcsc driver if needed

**"Build Fails with Dependencies"**
- Clear node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Clear cache: `npm cache clean --force`

---

## Version Information

- **Frontend**: React 19.2.0 with Vite 8.0.1
- **Backend**: Node.js Express 5.1.0
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite with Tailwind CSS
- **NFC Library**: nfc-pcsc 0.8.1

---

## Contact & Support

For deployment issues, check:
1. [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
2. [Supabase Documentation](https://supabase.com/docs)
3. [Express.js Guide](https://expressjs.com/)
4. Project README.md for additional details
