import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OrdersManagement from './pages/OrdersManagement';
import MenuManagement from './pages/MenuManagement';
import AnalyticsStatistics from './pages/AnalyticsStatistics';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="analytics" element={<AnalyticsStatistics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
