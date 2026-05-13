import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../supabaseClient';
import { normalizeRole } from '../../utils/helpers';

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
  const { user } = useAuth();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeId, setStoreId] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const normalizedUserRole = normalizeRole(user?.role);

  console.log('[Dashboard] === OWNER DASHBOARD INITIALIZATION ===');
  console.log('[Dashboard] User role:', user?.role);
  console.log('[Dashboard] User email:', user?.email);

  // Shopping Cart Functions
  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.spv_id === item.spv_id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.spv_id === item.spv_id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(cartItem => cartItem.spv_id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(cartItem =>
        cartItem.spv_id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      ));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (parseAmount(item.spv_price) * item.quantity), 0);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Fetch Owner's store
  useEffect(() => {
    const fetchOwnerStore = async () => {
      try {
        const authEmail = String(user?.email || '').trim().toLowerCase();

        if (!authEmail) {
          console.error('[Dashboard] No email found for Owner');
          setIsLoading(false); // Fix: Break the loading loop
          return;
        }

        console.log('[Dashboard] Fetching store for Owner email:', authEmail);
        const { data: store, error: storeError } = await supabase
          .from('tbl_canteenstore')
          .select('csv_id, csv_name')
          .eq('csv_email', authEmail)
          .maybeSingle();

        console.log('[Dashboard] Store query result:', store);
        console.log('[Dashboard] Store query error:', storeError);

        if (store) {
          console.log('[Dashboard] Owner store resolved - csv_id:', store.csv_id, 'name:', store.csv_name);
          setStoreId(store.csv_id);
          setStoreName(store.csv_name);
        } else {
          console.error('[Dashboard] No store found for Owner email:', authEmail);
          setIsLoading(false); // Fix: Break the loading loop if store returns null
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching Owner store:', err);
        setIsLoading(false); // Fix: Break the loading loop on error
      }
    };

    if (user?.email && normalizedUserRole === 'Owner') {
      fetchOwnerStore();
    } else {
      // Fix: Ensure we don't load forever if the role isn't Owner
      setIsLoading(false); 
    }
  }, [user?.email, normalizedUserRole]);

  // Fetch orders filtered by Owner's store
  useEffect(() => {
    const fetchOrders = async () => {
      if (!storeId) {
        console.log('[Dashboard] Waiting for storeId before fetching orders...');
        return;
      }

      try {
        setIsLoading(true);
        console.log('[Dashboard] Fetching orders for store csv_id:', storeId);
        
        // Query tbl_order directly by csv_id
        const { data: directOrders, error: directError } = await supabase
          .from('tbl_order')
          .select('*')
          .eq('csv_id', storeId)
          .order('ov_createdat', { ascending: false });

        if (directError) throw directError;

        console.log('[Dashboard] Fetched', directOrders?.length || 0, 'orders');

        if (!directOrders || directOrders.length === 0) {
          setOrders([]);
          return;
        }

        // Fetch order details
        const orderIds = directOrders.map(o => o.ov_id);
        const { data: detailsData } = await supabase
          .from('tbl_orderdetails')
          .select(`
            odv_id,
            ov_id,
            odv_quantity,
            tbl_storeproducts:spv_id (
              spv_name
            )
          `)
          .in('ov_id', orderIds);

        // Group details by order
        const detailsByOrder = {};
        if (detailsData) {
          detailsData.forEach(detail => {
            const orderId = detail.ov_id;
            if (!detailsByOrder[orderId]) {
              detailsByOrder[orderId] = [];
            }
            detailsByOrder[orderId].push({
              spv_name: detail.tbl_storeproducts?.spv_name || 'Unknown Item',
              odv_quantity: detail.odv_quantity
            });
          });
        }

        // Fetch user names
        const uniqueUserIds = [...new Set(directOrders.map(o => o.uv_id).filter(Boolean))];
        let usersById = {};

        if (uniqueUserIds.length > 0) {
          const { data: userRows } = await supabase
            .from('tbl_user')
            .select('uv_id, uv_firstname, uv_lastname')
            .in('uv_id', uniqueUserIds);

          if (userRows) {
            usersById = userRows.reduce((acc, u) => {
              acc[u.uv_id] = u;
              return acc;
            }, {});
          }
        }

        // Format orders
        const formattedOrders = directOrders.map(order => {
          const userRow = usersById[order.uv_id];
          return {
            ov_id: order.ov_id,
            ov_totalamount: order.ov_totalamount,
            ov_status: order.ov_status,
            ov_createdat: order.ov_createdat,
            uv_fullname: userRow
              ? `${userRow.uv_lastname || ''} ${userRow.uv_firstname || ''}`.trim()
              : 'Unknown Student',
            odv_items: detailsByOrder[order.ov_id] || []
          };
        });

        console.log('[Dashboard] Final formatted orders:', formattedOrders.length);
        setOrders(formattedOrders);
      } catch (error) {
        console.error('[Dashboard] Error fetching orders:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [storeId]);

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
    .filter((item) => item.spv_quantity <= 10)
    .sort((a, b) => a.spv_quantity - b.spv_quantity);
    
  const lowStockCount = alertItems.length;
  const pendingOrders = orders.filter((order) => order.ov_status === 'Pending').length;
  const completedOrders = orders.filter((order) => order.ov_status === 'Completed').length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

  const topSellingItem = orders
    .flatMap((order) => order.odv_items || [])
    .reduce((totals, item) => {
      totals[item.spv_name] = (totals[item.spv_name] ?? 0) + item.odv_quantity;
      return totals;
    }, {});

  const itemEntries = Object.entries(topSellingItem);

  const topEntry = itemEntries.length > 0
    ? itemEntries.sort((left, right) => right[1] - left[1])[0]
    : ['No item data', 0];

  const [_topItemName, _topItemOrders] = topEntry;

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + parseAmount(order.ov_totalamount);
  }, 0);

  const totalRevenueFormatted = formatAmount(totalRevenue);

  return (
    <div className="container-fluid p-4">
      {/* Page Title & Quick Actions */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="display-6 fw-bold text-primary mb-0">Dashboard</h2>
          <p className="text-muted">
            Welcome back, <strong className="text-dark">{formatUserName(user)}</strong>! 
            {storeName && <span className="text-primary"> • {storeName}</span>}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => navigate('/orders')} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
            <span className="material-symbols-outlined">list_alt</span>
            View All Orders
          </button>

          <button onClick={() => setShowCart(!showCart)} className="btn btn-info btn-sm d-flex align-items-center gap-2 position-relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            Shopping Cart
            {cartItemsCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartItemsCount}
              </span>
            )}
          </button>
          
          {/* OWNER ONLY: Add New Item */}
          {normalizedUserRole === 'Owner' && (
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
                    <tr key={order.ov_id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${avatarBackgrounds[index % avatarBackgrounds.length]}`} style={{width: '32px', height: '32px', fontSize: '12px'}}>
                            {getInitials(order.uv_fullname)}
                          </div>
                          <span className="small fw-semibold">{order.uv_fullname}</span>
                        </div>
                      </td>
                      <td className="small text-muted font-monospace">{order.ov_id}</td>
                      <td className="small text-truncate" style={{maxWidth: '150px'}}>{order.odv_items?.map(i => i.spv_name).join(', ')}</td>
                      <td className="small fw-bold">{formatAmount(order.ov_totalamount)}</td>
                      <td>
                        <span className={`badge rounded-pill ${getStatusStyle(order.ov_status)}`} style={{fontSize: '10px'}}>
                          {order.ov_status}
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
                  <div key={item.spv_id} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="small fw-bold">{item.spv_name}</div>
                      <div className="text-muted" style={{fontSize: '11px'}}>{item.spv_quantity} left</div>
                    </div>
                    <button className="btn btn-link btn-sm text-decoration-none p-0">Reorder</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* OWNER ONLY: Total Revenue Card */}
          {normalizedUserRole === 'Owner' && (
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

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <span className="material-symbols-outlined">shopping_cart</span>
                  Shopping Cart
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCart(false)}></button>
              </div>
              <div className="modal-body">
                {cart.length === 0 ? (
                  <div className="text-center py-5">
                    <span className="material-symbols-outlined text-muted" style={{fontSize: '48px'}}>shopping_cart</span>
                    <p className="text-muted mt-3">Your cart is empty</p>
                    <p className="text-muted small">Click on menu items below to add them to your cart</p>
                  </div>
                ) : (
                  <div>
                    {cart.map(item => (
                      <div key={item.spv_id} className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded bg-light">
                        <div className="flex-grow-1">
                          <div className="fw-bold">{item.spv_name}</div>
                          <div className="text-muted small">{formatAmount(item.spv_price)} each</div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateCartQuantity(item.spv_id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="px-2 fw-bold">{item.quantity}</span>
                          <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateCartQuantity(item.spv_id, item.quantity + 1)}
                          >
                            +
                          </button>
                          <span className="fw-bold ms-2" style={{minWidth: '80px', textAlign: 'right'}}>
                            {formatAmount(parseAmount(item.spv_price) * item.quantity)}
                          </span>
                          <button 
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => removeFromCart(item.spv_id)}
                          >
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <hr />

                <div className="p-3 bg-light rounded mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatAmount(cartTotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total:</span>
                    <span className="text-primary">{formatAmount(cartTotal)}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-bold mb-3">Add Items to Cart</h6>
                  <div className="row g-2">
                    {menuItems.length > 0 ? (
                      menuItems.map(item => (
                        <div key={item.spv_id} className="col-sm-6">
                          <div className="card h-100 border-light">
                            <div className="card-body p-2">
                              <h6 className="card-title small fw-bold mb-1">{item.spv_name}</h6>
                              <p className="card-text small text-muted mb-2">{formatAmount(item.spv_price)}</p>
                              <button 
                                className="btn btn-sm btn-primary w-100"
                                onClick={() => addToCart(item)}
                              >
                                <span className="material-symbols-outlined me-1" style={{fontSize: '16px'}}>add_shopping_cart</span>
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <p className="text-muted text-center py-3">No menu items available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCart(false)}>Close</button>
                <button className="btn btn-primary" disabled={cart.length === 0}>
                  <span className="material-symbols-outlined me-1" style={{fontSize: '18px'}}>done</span>
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                        <tr key={order.ov_id}>
                          <td className="small">{getOrderTime(order.ov_createdat)}</td>
                          <td className="small fw-bold">{order.uv_fullname}</td>
                          <td className="small text-muted font-monospace">{order.ov_id}</td>
                          <td className="small">{order.odv_items?.map(i => i.spv_name).join(', ')}</td>
                          <td className="small fw-bold">{formatAmount(order.ov_totalamount)}</td>
                          <td>
                            <span className={`badge rounded-pill ${getStatusStyle(order.ov_status)}`}>
                              {order.ov_status}
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