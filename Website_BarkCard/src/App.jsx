import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/StorePages/Page_Dashboard';
import OrdersManagement from './pages/StorePages/Page_OrdersManagement';
import MenuManagement from './pages/StorePages/Page_MenuManagement';
import AnalyticsStatistics from './pages/StorePages/Page_AnalyticsStatistics';
import AdminLogin from './pages/StorePages/Page_AdminLogin';
import SuperAdminDashboard from './pages/SuperAdminPages/Page_SuperAdminDashboard';
import UserManagement from './pages/SuperAdminPages/Page_SuperAdminUserManagement';
import SuperAdminReports from './pages/SuperAdminPages/Page_SuperAdminReports';
import StoreManagement from './pages/SuperAdminPages/Page_SuperAdminStoreManagement';
import { initialOrders } from './data/orders';
import { useAuth } from './hooks/useAuth';
import { supabase } from './supabaseClient';
import { isSuperAdmin } from './utils/helpers';

const isSuperAdminRole = (role) => {
  return isSuperAdmin(role);
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

const mapStoreProductToMenuItem = (product) => ({
  SPv_ID: product.spv_id,
  CSv_ID: product.csv_id ?? 1,
  SPv_RefNum: product.spv_refnum ?? '',
  SPv_Name: product.spv_name ?? '',
  SPv_Description: '',
  SPv_Category: 'Main Course',
  SPv_Price: Number(product.spv_price ?? 0),
  SPv_Quantity: Number(product.spv_quantity ?? 0),
  SPv_IMG: product.spv_img ?? ''
});

function App() {
  const [orders] = useState(initialOrders);
  const [menuItems, setMenuItems] = useState([]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tbl_storeproducts')
        .select('spv_id, csv_id, spv_img, spv_refnum, spv_name, spv_quantity, spv_price')
        .order('spv_name', { ascending: true });

      if (error) {
        throw error;
      }

      setMenuItems((data ?? []).map(mapStoreProductToMenuItem));
    } catch (error) {
      console.error('Error fetching menu items from Supabase:', error);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
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
        <Route
          path="/superadmin/reports"
          element={(
            <RequireSuperAdmin>
              <SuperAdminReports />
            </RequireSuperAdmin>
          )}
        />
        <Route
          path="/superadmin/stores"
          element={(
            <RequireSuperAdmin>
              <StoreManagement />
            </RequireSuperAdmin>
          )}
        />
        <Route element={<Layout />}>
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
                <MenuManagement menuItems={menuItems} setMenuItems={setMenuItems} refreshMenuItems={fetchMenuItems} />
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
