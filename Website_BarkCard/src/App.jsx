import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OrdersManagement from './pages/OrdersManagement';
import MenuManagement from './pages/MenuManagement';
import AnalyticsStatistics from './pages/AnalyticsStatistics';
import AdminLogin from './pages/AdminLogin';
import { initialOrders } from './data/orders';
import { initialMenuItems } from './data/menuItems';

function App() {
  const [orders, setOrders] = useState(initialOrders);
  const [menuItems, setMenuItems] = useState(initialMenuItems);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<Dashboard orders={orders} menuItems={menuItems} />} />
          <Route path="orders" element={<OrdersManagement orders={orders} setOrders={setOrders} />} />
          <Route path="menu" element={<MenuManagement menuItems={menuItems} setMenuItems={setMenuItems} />} />
          <Route path="analytics" element={<AnalyticsStatistics orders={orders} menuItems={menuItems} />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
