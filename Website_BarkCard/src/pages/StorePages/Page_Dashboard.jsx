import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
<<<<<<< HEAD
import { useAuth } from '../../hooks/useAuth'; // Adjust the import path as needed
=======
import { useAuth } from '../../hooks/useAuth';
>>>>>>> 5d7e629342455d7918e8fa4b27b671377fe062e6
import { supabase } from '../../supabaseClient';

const avatarBackgrounds = [
  'bg-primary text-white',
  'bg-secondary text-white',
  'bg-success text-white',
  'bg-danger text-white',
  'bg-info text-dark'
];

const getInitials = (name) =>
  name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('')
    : '??';

const getOrderTime = (dateTime) => (dateTime && dateTime.includes(', ') ? dateTime.split(', ').at(-1) : dateTime);

const formatAmount = (amount) => {
  return `₱${(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const parseAmount = (amount) => {
  return typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-warning text-dark';
    case 'Preparing':
      return 'bg-info text-dark';
    case 'Ready':
      return 'bg-primary text-white';
    case 'Completed':
      return 'bg-success text-white';
    case 'Cancelled':
      return 'bg-danger text-white';
    default:
      return 'bg-secondary text-white';
  }
};

// Helper function to format the user's name to "Last Name First Name"
const formatUserName = (user) => {
  if (!user) return 'Guest';
  
  // If your user object stores them as separate fields
  if (user.lastName || user.firstName) {
    return `${user.lastName || ''} ${user.firstName || ''}`.trim();
  }
  
  // If your user object stores it as a single string (e.g., user.name or user.fullName)
  const fullName = user.name || user.fullName || '';
  if (fullName) {
    const parts = fullName.trim().split(' ');
    if (parts.length > 1) {
      const lastName = parts.pop(); // Extracts the last word
      const firstName = parts.join(' '); // Keeps the rest as first name
      return `${lastName} ${firstName}`;
    }
    return fullName;
  }
  
  return 'User';
};

export default function Dashboard({ menuItems = [] }) {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // State for fetching Supabase data
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from Supabase on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // Fetch order, user name, and nested order details + product names
        const { data, error } = await supabase
          .from('tbl_Order')
          .select(`
            Ov_ID,
            Ov_TotalAmount,
            Ov_Status,
            Ov_CreatedAt,
            tbl_User ( Uv_FullName ),
            tbl_OrderDetails (
              ODv_Quantity,
              tbl_StoreProducts ( SPv_Name )
            )
          `)
          .order('Ov_CreatedAt', { ascending: false });

        if (error) throw error;

        // Map Supabase payload to the structure the component expects
        const formattedOrders = data.map(order => ({
          Ov_ID: order.Ov_ID,
          Ov_TotalAmount: order.Ov_TotalAmount,
          Ov_Status: order.Ov_Status,
          Ov_CreatedAt: order.Ov_CreatedAt,
          Uv_FullName: order.tbl_User?.Uv_FullName || 'Unknown Student',
          ODv_Items: order.tbl_OrderDetails.map(detail => ({
            SPv_Name: detail.tbl_StoreProducts?.SPv_Name || 'Unknown Item',
            ODv_Quantity: detail.ODv_Quantity
          }))
        }));

        setOrders(formattedOrders);
        
      } catch (error) {
        console.error("Error fetching orders from Supabase:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Show a loading spinner while waiting for Supabase data
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 4);
  const totalOrders = orders.length;
  
  const alertItems = menuItems
    .filter((item) => item.SPv_Quantity <= 10)
    .sort((a, b) => a.SPv_Quantity - b.SPv_Quantity);
    
  const lowStockCount = alertItems.length;
  const pendingOrders = orders.filter((order) => order.Ov_Status === 'Pending').length;
  const completedOrders = orders.filter((order) => order.Ov_Status === 'Completed').length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const topSellingItem = orders
    .flatMap((order) => order.ODv_Items || [])
    .reduce((totals, item) => {
      totals[item.SPv_Name] = (totals[item.SPv_Name] ?? 0) + item.ODv_Quantity;
      return totals;
    }, {});

  const itemEntries = Object.entries(topSellingItem);

  const topEntry = itemEntries.length > 0
    ? itemEntries.sort((left, right) => right[1] - left[1])[0]
    : ['No item data', 0];

  const [_topItemName, _topItemOrders] = topEntry;

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + parseAmount(order.Ov_TotalAmount);
  }, 0);

  const totalRevenueFormatted = formatAmount(totalRevenue);

  return (
    <div className="container-fluid p-4">
      {/* Page Title & Quick Actions */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="display-6 fw-bold text-primary mb-0">Dashboard</h2>
          {/* Displays the formatted user name */}
          <p className="text-muted">
            Welcome back, <strong className="text-dark">{formatUserName(user)}</strong>! Overview of today's academic dining operations.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => navigate('/orders')} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">list_alt</span>
            View All Orders
          </button>
          
          {/* OWNER ONLY: Add New Item */}
          {user?.role === 'Owner' && (
            <button onClick={() => navigate('/menu')} className="btn btn-primary btn-sm d-flex align-items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Add New Item
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 p-3">
            <span className="material-symbols-outlined text-primary fs-2">calendar_today</span>
            <p className="text-uppercase small fw-bold text-muted mt-2 mb-1">Total Orders</p>
            <h3 className="fw-bold">{totalOrders}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 p-3">
            <span className="material-symbols-outlined text-warning fs-2">pending_actions</span>
            <p className="text-uppercase small fw-bold text-muted mt-2 mb-1">Pending</p>
            <h3 className="fw-bold">{pendingOrders}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 p-3">
            <span className="material-symbols-outlined text-success fs-2">check_circle</span>
            <p className="text-uppercase small fw-bold text-muted mt-2 mb-1">Completed</p>
            <h3 className="fw-bold">{completedOrders}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100 p-3">
            <span className="material-symbols-outlined text-danger fs-2">warning</span>
            <p className="text-uppercase small fw-bold text-muted mt-2 mb-1">Low Stock</p>
            <h3 className="text-danger fw-bold">{lowStockCount}</h3>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Orders Table */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Recent Orders</h5>
              <button onClick={() => setIsHistoryOpen(true)} className="btn btn-link btn-sm p-0">View History</button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small fw-bold">Student</th>
                    <th className="small fw-bold">ID</th>
                    <th className="small fw-bold">Items</th>
                    <th className="small fw-bold">Total</th>
                    <th className="small fw-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={order.Ov_ID}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${avatarBackgrounds[index % avatarBackgrounds.length]}`} style={{width: '32px', height: '32px', fontSize: '12px'}}>
                            {getInitials(order.Uv_FullName)}
                          </div>
                          <span className="small fw-semibold">{order.Uv_FullName}</span>
                        </div>
                      </td>
                      <td className="small text-muted font-monospace">{order.Ov_ID}</td>
                      <td className="small text-truncate" style={{maxWidth: '150px'}}>{order.ODv_Items?.map(i => i.SPv_Name).join(', ')}</td>
                      <td className="small fw-bold">{formatAmount(order.Ov_TotalAmount)}</td>
                      <td>
                        <span className={`badge rounded-pill ${getStatusStyle(order.Ov_Status)}`} style={{fontSize: '10px'}}>
                          {order.Ov_Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <span className="material-symbols-outlined text-danger">inventory_2</span>
                Inventory Alerts
              </h5>
              {alertItems.length === 0 ? (
                <p className="small text-muted">All items are well stocked.</p>
              ) : (
                alertItems.slice(0, 3).map((item) => (
                  <div key={item.SPv_ID} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="small fw-bold">{item.SPv_Name}</div>
                      <div className="text-muted" style={{fontSize: '11px'}}>{item.SPv_Quantity} left</div>
                    </div>
                    <button className="btn btn-link btn-sm text-decoration-none p-0">Reorder</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* OWNER ONLY: Total Revenue Card */}
          {user?.role === 'Owner' && (
            <div className="card bg-primary text-white border-0 shadow-sm p-3">
              <p className="small text-uppercase fw-bold mb-1 opacity-75">Total Revenue</p>
              <h2 className="fw-bold mb-3">{totalRevenueFormatted}</h2>
              <div className="progress mb-2" style={{height: '6px'}}>
                <div className="progress-bar bg-white" style={{ width: `${completionRate}%` }}></div>
              </div>
              <p className="small mb-0 opacity-75">{completionRate}% Completion Rate</p>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content border-0">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Order History</h5>
                <button type="button" className="btn-close" onClick={() => setIsHistoryOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Time</th>
                        <th>Student</th>
                        <th>ID</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.Ov_ID}>
                          <td className="small">{getOrderTime(order.Ov_CreatedAt)}</td>
                          <td className="small fw-bold">{order.Uv_FullName}</td>
                          <td className="small text-muted font-monospace">{order.Ov_ID}</td>
                          <td className="small">{order.ODv_Items?.map(i => i.SPv_Name).join(', ')}</td>
                          <td className="small fw-bold">{formatAmount(order.Ov_TotalAmount)}</td>
                          <td>
                            <span className={`badge rounded-pill ${getStatusStyle(order.Ov_Status)}`}>
                              {order.Ov_Status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setIsHistoryOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
