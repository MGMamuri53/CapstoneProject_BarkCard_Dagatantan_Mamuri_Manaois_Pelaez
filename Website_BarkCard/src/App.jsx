import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/StorePages/Page_Dashboard';
import OrdersManagement from './pages/StorePages/Page_OrdersManagement';
import MenuManagement from './pages/StorePages/Page_MenuManagement';
import AnalyticsStatistics from './pages/StorePages/Page_AnalyticsStatistics';
import AdminLogin from './pages/StorePages/Page_AdminLogin';
import SuperAdminDashboard from './pages/SuperAdminPages/Page_SuperAdminDashboard';
import UserManagement from './pages/SuperAdminPages/Page_SuperAdminUserManagement';
import { initialOrders } from './data/orders';
import { initialMenuItems } from './data/menuItems';
import { useAuth } from './hooks/useAuth';

const isSuperAdminRole = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  return normalizedRole === 'superadmin' || normalizedRole === 'superadministrator';
};

function ProtectLoginPage({ children }) {
  const { user } = useAuth();
  
  // If already logged in, redirect to appropriate dashboard
  if (user && user.role) {
    if (isSuperAdminRole(user.role)) {
      return <Navigate to="/superadmin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Allow access to login page if not authenticated
  return children;
}

function RequireStoreAccess({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isSuperAdminRole(user?.role)) {
    return <Navigate to="/superadmin" replace />;
  }

  return children;
}

function RequireSuperAdmin({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdminRole(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const [orders] = useState(initialOrders);
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route
          path="/login"
          element={(
            <ProtectLoginPage>
              <AdminLogin />
            </ProtectLoginPage>
          )}
        />
        <Route
          path="/superadmin"
          element={(
            <RequireSuperAdmin>
              <SuperAdminDashboard />
            </RequireSuperAdmin>
          )}
        />
        <Route
          path="/superadmin/users"
          element={(
            <RequireSuperAdmin>
              <UserManagement />
            </RequireSuperAdmin>
          )}
        />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route
            path="dashboard"
            element={(
              <RequireStoreAccess>
                <Dashboard orders={orders} menuItems={menuItems} />
              </RequireStoreAccess>
            )}
          />
          <Route
            path="orders"
            element={(
              <RequireStoreAccess>
                <OrdersManagement />
              </RequireStoreAccess>
            )}
          />
          <Route
            path="menu"
            element={(
              <RequireStoreAccess>
                <MenuManagement menuItems={menuItems} setMenuItems={setMenuItems} />
              </RequireStoreAccess>
            )}
          />
          <Route
            path="analytics"
            element={(
              <RequireStoreAccess>
                <AnalyticsStatistics orders={orders} menuItems={menuItems} />
              </RequireStoreAccess>
            )}
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
