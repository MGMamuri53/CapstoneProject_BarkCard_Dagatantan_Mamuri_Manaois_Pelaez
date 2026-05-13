# BarkCard - NFC-Based Canteen Management System

A comprehensive React-based web application for managing canteen operations with NFC card integration for student identification and balance management.

## Features

✨ **Core Features**
- User management (Students, Staff, Owners, SuperAdmins)
- NFC card assignment and scanning
- Canteen store management
- Menu management with product inventory
- Order tracking and management
- Balance management for users
- Analytics and reporting dashboard
- Role-based access control

🔐 **Security**
- SuperAdmin role for system administration
- Owner role for store managers
- Staff role for canteen staff
- Student role for end users
- Row-Level Security (RLS) on Supabase
- Protected routes with role-based access

📱 **Technical Stack**
- **Frontend**: React 19.2.0 with Vite 8.0.1
- **Styling**: Bootstrap 5.3.8 + Tailwind CSS 4.2.2
- **Database**: Supabase (PostgreSQL)
- **Backend API**: Express.js (NFC Server)
- **NFC Hardware**: ACR122U NFC Reader with nfc-pcsc

## Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Supabase account with database setup
- ACR122U NFC reader (for NFC features)

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd Website_BarkCard
npm install
```

2. **Configure environment**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. **Install NFC Server dependencies**
```bash
cd nfc-server
npm install
cd ..
```

### Development

**Terminal 1: Frontend (Vite dev server)**
```bash
npm run dev
# Opens at http://localhost:5173
```

**Terminal 2: NFC Server (if using NFC features)**
```bash
cd nfc-server
npm start
# Runs on http://localhost:3001
```

### Production Build

```bash
npm run build
# Creates optimized dist/ folder

npm run preview
# Preview production build locally
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ErrorBoundary.jsx
│   ├── Header.jsx
│   ├── Layout.jsx
│   └── Sidebar.jsx
├── pages/              # Page components
│   ├── StorePages/     # Staff/Owner pages
│   │   ├── Page_AdminLogin.jsx
│   │   ├── Page_Dashboard.jsx
│   │   ├── Page_MenuManagement.jsx
│   │   ├── Page_OrdersManagement.jsx
│   │   └── Page_AnalyticsStatistics.jsx
│   └── SuperAdminPages/  # SuperAdmin pages
│       ├── Page_SuperAdminDashboard.jsx
│       ├── Page_SuperAdminUserManagement.jsx
│       ├── Page_SuperAdminStoreManagement.jsx
│       ├── Page_SuperAdminReports.jsx
├── hooks/              # Custom React hooks
│   ├── AuthProvider.jsx
│   ├── useAuth.jsx
│   └── useOrders.jsx
├── utils/              # Utility functions
│   ├── helpers.js
│   └── nfcHelper.js   # NFC integration utilities
├── constants/          # App constants
├── data/               # Static data
├── App.jsx            # Main app component
└── main.jsx           # Entry point

nfc-server/
├── server.js          # NFC Express server
└── package.json
```

## Database Schema

### Tables
- **tbl_user** - User accounts with NFC ID field
- **tbl_student_balance** - User account balances
- **tbl_canteenstore** - Canteen store information
- **tbl_storeproduct** - Menu items and products
- **tbl_orders** - Order history and tracking

See Supabase documentation for detailed schema.

## NFC Integration

### Hardware Setup
1. Connect ACR122U NFC reader via USB
2. Ensure nfc-pcsc driver is installed
3. Start NFC server: `cd nfc-server && npm start`

### Usage
1. Navigate to SuperAdmin > User Management
2. Select a user from the list
3. Click "💳 Assign NFC ID" button
4. Tap NFC card on reader within 10 seconds
5. Card ID is automatically saved to database

### NFC Endpoints
- `GET /api/nfc/read` - Get current card
- `GET /api/nfc/wait` - Wait for card tap (30s timeout)

## Deployment

### Frontend Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

Recommended platforms:
- Vercel (recommended - easiest setup)
- Netlify
- AWS Amplify
- DigitalOcean App Platform

### Environment Variables
Production `.env` must include:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build & Deploy
```bash
# Build production bundle
npm run build

# Upload dist/ folder to your hosting platform
# Set environment variables on hosting platform
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

## API Reference

### Authentication
- Login with user credentials
- Role-based route protection
- Automatic session sync with Supabase

### NFC Operations
- Detect and read NFC cards
- Assign card IDs to users
- Store NFC IDs in database
- 10-second assignment timeout

### User Management
- Create new users
- Edit user profiles
- Assign roles (Student, Staff, Owner, SuperAdmin)
- Manage store assignments for Owners
- Deactivate accounts (Hold status)

## Security Features

✅ **Authentication**
- Supabase built-in auth
- Session persistence
- Role-based access control

✅ **Data Protection**
- Row-Level Security (RLS) on all tables
- Environment variables for sensitive data
- CORS protection
- No sensitive data in client code

✅ **Best Practices**
- Error boundary for crash prevention
- Input validation
- Error handling on all API calls
- Secure token management

## Troubleshooting

**Build Issues**
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**NFC Not Working**
- Verify NFC server is running on port 3001
- Check NFC reader is connected
- Ensure card is ISO14443-A compatible
- Check browser console for connection errors

**Database Connection Issues**
- Verify .env variables are correct
- Check Supabase project is active
- Verify RLS policies are configured

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) and [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for more help.

## Performance

- Build size: 640kb JS (176kb gzipped)
- First load: < 2s on typical connection
- Optimized code splitting for faster loading
- Bootstrap icons optimized

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

ISC

## Support

For issues or questions:
1. Check DEPLOYMENT_GUIDE.md
2. Review error messages in browser console
3. Check Supabase dashboard for database issues
4. Verify environment variables are set correctly

---

**Version**: 1.0.0
**Status**: Production Ready ✅
**Last Updated**: May 13, 2026
