import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';

export default function OrdersManagement() {
  const { user } = useAuth();
  const { globalSearchTerm = '' } = useOutletContext() ?? {};
  const { orders, isLoading, error, updateOrderStatus } = useOrders();
  const [selectedStatus, setSelectedStatus] = useState('All Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  // Helper functions
  const getOrderItemsString = (items) => {
    return items?.map(item => item.SPv_Name).join(', ') || '';
  };

  const formatAmount = (amount) => {
    return `₱${(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const parseAmount = (amount) => {
    return typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0;
  };

  const normalizedGlobalQuery = globalSearchTerm.trim().toLowerCase();
  const searchFilteredOrders = orders.filter((order) => {
    if (!normalizedGlobalQuery) {
      return true;
    }

    const searchableText = [
      order.Uv_FullName,
      order.Ov_ID,
      getOrderItemsString(order.ODv_Items),
      order.Ov_Status,
      order.Ov_CreatedAt,
      order.Uv_ID,
      order.Uv_Email,
      order.WTv_Type,
      order.Ov_TotalAmount
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedGlobalQuery);
  });

  const pendingOrders = orders.filter((order) => order.Ov_Status === 'Pending');
  const processingOrders = orders.filter((order) => order.Ov_Status === 'Processing');
  const readyOrders = orders.filter((order) => order.Ov_Status === 'Ready');
  const completedOrders = orders.filter((order) => order.Ov_Status === 'Completed');
  const activeOrders = orders.filter((order) => order.Ov_Status !== 'Cancelled');
  const queueOrdersCount = pendingOrders.length + processingOrders.length;
  const kitchenLoad = activeOrders.length > 0 ? Math.round((queueOrdersCount / activeOrders.length) * 100) : 0;

  const completedRevenue = completedOrders.reduce((sum, order) => sum + parseAmount(order.Ov_TotalAmount), 0);
  const queuedRevenue = pendingOrders
    .concat(processingOrders)
    .reduce((sum, order) => sum + parseAmount(order.Ov_TotalAmount), 0);
  const formattedCompletedRevenue = formatAmount(completedRevenue);
  const formattedQueuedRevenue = formatAmount(queuedRevenue);

  const filteredOrders =
    selectedStatus === 'All Orders'
      ? searchFilteredOrders
      : searchFilteredOrders.filter((order) => order.Ov_Status === selectedStatus);
  
  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success && selectedOrder && selectedOrder.Ov_ID === orderId) {
      setSelectedOrder(prev => ({ ...prev, Ov_Status: newStatus }));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Processing':
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

  const showingFrom = filteredOrders.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + ordersPerPage, filteredOrders.length);

  return (
    <div className="p-5 pt-lg">
      <div className="mb-5">
        <h2 className="display-5 fw-bold mb-4">Order Management</h2>
        <div className="d-flex flex-wrap gap-2">
          {['All Orders', 'Pending', 'Processing', 'Ready', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`btn btn-sm ${selectedStatus === status ? 'btn-primary' : 'btn-light'}`}
              type="button"
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="alert alert-info" role="alert">
          <span className="spinner-border spinner-border-sm me-2"></span>
          Loading orders...
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          Error loading orders: {error}
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="alert alert-warning" role="alert">
          No orders found.
        </div>
      )}

      <div className="card border-0 shadow-sm mb-5">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-uppercase small fw-bold text-secondary">Student Name</th>
                <th className="text-uppercase small fw-bold text-secondary">Order ID</th>
                <th className="text-uppercase small fw-bold text-secondary">Items Ordered</th>
                <th className="text-uppercase small fw-bold text-secondary">Total Price</th>
                <th className="text-uppercase small fw-bold text-secondary">Date/Time</th>
                <th className="text-uppercase small fw-bold text-secondary">Status</th>
                <th className="text-uppercase small fw-bold text-secondary text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.Ov_ID}>
                  <td className="py-4">
                    <div className="d-flex align-items-center gap-3">
                      <img className="rounded-circle" src={order.Uv_Image} alt="Student" width="32" height="32" />
                      <span className="fw-medium">{order.Uv_FullName}</span>
                    </div>
                  </td>
                  <td className="py-4 small font-monospace text-secondary">{order.Ov_ID}</td>
                  <td className="py-4 small">{getOrderItemsString(order.ODv_Items)}</td>
                  <td className="py-4 small fw-bold text-primary">{formatAmount(order.Ov_TotalAmount)}</td>
                  <td className="py-4 small text-secondary">{order.Ov_CreatedAt}</td>
                  <td className="py-4">
                    <span className={`badge rounded-pill small ${getStatusStyle(order.Ov_Status)}`}>{order.Ov_Status.toUpperCase()}</span>
                  </td>
                  <td className="py-4 text-end">
                    <button onClick={() => handleViewDetails(order)} className="btn btn-link btn-sm text-primary p-0" type="button">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-secondary">No orders found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-top bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="small text-secondary">
            Showing {showingFrom}-{showingTo} of {filteredOrders.length} orders
          </span>
          <nav aria-label="Page navigation">
            <ul className="pagination mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-link" type="button">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button onClick={() => handlePageChange(page)} className="page-link" type="button">
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-link" type="button">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-4">
          <button onClick={() => setSelectedStatus('Pending')} className="card btn btn-light border-primary w-100 text-start p-0" type="button">
            <div className="card-body">
              <span className="material-symbols-outlined text-primary fs-2">pending_actions</span>
              <h3 className="card-title fw-bold mt-2">Queue Overview</h3>
              <p className="card-text small text-secondary mb-0">
                {queueOrdersCount} order{queueOrdersCount === 1 ? '' : 's'} are waiting for prep. Kitchen load is {kitchenLoad}%.
              </p>
            </div>
          </button>
        </div>
        <div className="col-md-6 col-lg-4">
          <button onClick={() => setSelectedStatus('Ready')} className="card btn btn-light border-info w-100 text-start p-0" type="button">
            <div className="card-body">
              <span className="material-symbols-outlined text-info fs-2">notifications_active</span>
              <h3 className="card-title fw-bold mt-2">Ready Alerts</h3>
              <p className="card-text small text-secondary mb-0">
                {readyOrders.length} order{readyOrders.length === 1 ? '' : 's'} marked as Ready are awaiting pickup.
              </p>
            </div>
          </button>
        </div>
        
        {/* OWNER ONLY: Daily Summary with Revenue */}
        {user?.role === 'Owner' && (
          <div className="col-md-6 col-lg-4">
            <button onClick={() => setSelectedStatus('All Orders')} className="card btn btn-light w-100 text-start p-0" type="button">
              <div className="card-body">
                <span className="material-symbols-outlined text-secondary fs-2">analytics</span>
                <h3 className="card-title fw-bold mt-2">Daily Summary</h3>
                <p className="card-text small text-secondary mb-1">
                  Completed revenue: {formattedCompletedRevenue} from {completedOrders.length} completed order{completedOrders.length === 1 ? '' : 's'}.
                </p>
                <p className="card-text small text-muted mb-0">Queued potential: {formattedQueuedRevenue}</p>
              </div>
            </button>
          </div>
        )}
      </div>

      <button className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-4" style={{ width: '3.5rem', height: '3.5rem', zIndex: 1000 }} type="button">
        <span className="material-symbols-outlined">print</span>
      </button>

      {/* Details Modal remains completely unchanged */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0">
              <div className="modal-header border-0">
                <div>
                  <h3 className="modal-title fw-bold">Order Details</h3>
                  <p className="small text-secondary mb-0">Order {selectedOrder.Ov_ID}</p>
                </div>
                <button onClick={() => setIsDetailsModalOpen(false)} className="btn-close" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Student Information
                  </h4>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img className="rounded-circle" src={selectedOrder.Uv_Image} alt="Student" width="48" height="48" />
                    <div>
                      <p className="fw-semibold mb-0">{selectedOrder.Uv_FullName}</p>
                      <p className="small text-secondary mb-0">{selectedOrder.Uv_ID}</p>
                    </div>
                  </div>
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <span className="text-secondary">Email:</span>
                      <p className="mb-0">{selectedOrder.Uv_Email}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Phone:</span>
                      <p className="mb-0">{selectedOrder.Uv_Phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">restaurant</span>
                    Order Items
                  </h4>
                  <div>
                    {selectedOrder.ODv_Items?.map((item, index) => (
                      <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom small">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-medium">{item.SPv_Name}</span>
                          <span className="text-secondary">x{item.ODv_Quantity}</span>
                        </div>
                        <span className="fw-semibold text-primary">{formatAmount(item.ODv_Subtotal)}</span>
                      </div>
                    ))}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top small">
                      <span className="fw-bold">Total</span>
                      <span className="fw-bold text-primary fs-5">{formatAmount(selectedOrder.Ov_TotalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-light rounded-2 p-3 mb-3">
                  <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    Order Details
                  </h4>
                  <div className="row g-3 small">
                    <div className="col-md-6">
                      <span className="text-secondary">Order Date/Time:</span>
                      <p className="mb-0">{selectedOrder.Ov_CreatedAt}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Payment Method:</span>
                      <p className="mb-0">{selectedOrder.WTv_Type}</p>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Status:</span>
                      <select
                        value={selectedOrder.Ov_Status}
                        onChange={(e) => handleStatusChange(selectedOrder.Ov_ID, e.target.value)}
                        className="form-select form-select-sm mt-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Ready">Ready</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <span className="text-secondary">Special Instructions:</span>
                      <p className="mb-0">{selectedOrder.Ov_SpecialInstructions || 'None'}</p>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 pt-3">
                  <button onClick={() => setIsDetailsModalOpen(false)} className="btn btn-light flex-grow-1" type="button">
                    Close
                  </button>
                  <button className="btn btn-primary flex-grow-1" type="button">
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}