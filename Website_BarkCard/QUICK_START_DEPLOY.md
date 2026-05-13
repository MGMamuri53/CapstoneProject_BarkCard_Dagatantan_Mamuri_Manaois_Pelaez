# 🚀 Quick Start - Deploy BarkCard in 5 Minutes

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Step 1: Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Production ready - all fixes applied"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Select your `BarkCard` repository
4. **Important**: Add Environment Variables:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key
5. Click "Deploy"

**Done!** Your site is live at `https://your-project.vercel.app`

---

## Option 2: Deploy to Netlify

### Step 1: Build Locally
```bash
npm install
npm run build
```

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag the `dist/` folder into the deploy area
4. **Add Environment Variables** in Site Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Done!** Your site is live

---

## Option 3: Manual Server Deployment

### On Your Server
```bash
# Install Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <your-repo-url>
cd Website_BarkCard
npm install

# Create .env file
echo "VITE_SUPABASE_URL=your_url" > .env
echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env

# Build and serve
npm run build

# Use a process manager to run it
npm install -g pm2
pm2 start "npm run preview" --name barkcard
pm2 startup
pm2 save
```

---

## Setup NFC Server

### On Machine with NFC Reader
```bash
# SSH into or open terminal on the machine with NFC reader

cd Website_BarkCard/nfc-server
npm install

# Start the NFC server
npm start

# Keep it running with PM2
npm install -g pm2
pm2 start server.js --name nfc-server
pm2 startup
pm2 save
```

**Result**: NFC server runs on `http://localhost:3001`

---

## Configure Supabase

### Create Required Tables
Execute these SQL queries in Supabase SQL Editor:

```sql
-- Already exists, just verify:
-- tbl_user (with uv_nfcid column)
-- tbl_student_balance
-- tbl_canteenstore
-- tbl_storeproduct
-- tbl_orders
```

### Enable RLS (Row Level Security)
In Supabase:
1. Go to Authentication → Policies
2. Enable RLS on all tables
3. Create policies for SuperAdmin, Owner, Staff, Student roles

---

## Verify Deployment

### Test Frontend
```bash
# Visit your deployed URL
https://your-barkcard.vercel.app

# Should see login page
# Test login with a test account
```

### Test NFC Server
```bash
# From frontend machine, test connection
curl http://localhost:3001/api/nfc/read

# Should return: {"success": false, "message": "No card detected"}
```

### Test Database
1. Log in as SuperAdmin
2. Go to User Management
3. Create a new user
4. Click "Assign NFC ID"
5. Tap a card on the reader
6. Verify NFC ID is saved

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Build failed" | Run `npm install` then `npm run build` |
| "Supabase not connecting" | Check .env variables in deployment settings |
| "NFC not working" | Verify NFC server is running and port 3001 is accessible |
| "Login page not showing" | Clear cache: Ctrl+Shift+Delete, then refresh |
| "Blank page" | Check browser console for errors (F12) |

---

## Environment Variables Needed

**Frontend (.env in root)**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**NFC Server**
- No environment variables needed
- Ensure port 3001 is available

---

## URLs After Deployment

| Component | URL |
|-----------|-----|
| Frontend | `https://your-barkcard.vercel.app` |
| NFC Server | `http://localhost:3001` |
| Supabase Dashboard | `https://supabase.com/dashboard` |

---

## Monitoring

### After Going Live
1. **Check error logs** (browser console, server logs)
2. **Monitor Supabase** usage dashboard
3. **Test NFC** functionality monthly
4. **Keep dependencies** updated

### Useful Commands
```bash
# Check if services are running
npm list -g pm2
pm2 list
pm2 logs

# View recent errors
pm2 logs nfc-server
pm2 logs barkcard
```

---

## Need Help?

📖 **Full Guides**: See DEPLOYMENT_GUIDE.md
✅ **Checklist**: See PRODUCTION_CHECKLIST.md
🔧 **NFC Setup**: See NFC_SETUP.md
📝 **What Changed**: See FINAL_POLISH_REPORT.md

---

## Version
- **BarkCard**: v1.0.0
- **Status**: ✅ Production Ready
- **Date**: May 13, 2026

**You're all set! Your BarkCard system is ready to go live! 🎉**
