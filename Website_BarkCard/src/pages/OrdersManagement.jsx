import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function OrdersManagement({ orders, setOrders }) {
  const { globalSearchTerm = '' } = useOutletContext() ?? {};
  const [selectedStatus, setSelectedStatus] = useState('All Orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 8;

  const normalizedGlobalQuery = globalSearchTerm.trim().toLowerCase();
  const searchFilteredOrders = orders.filter((order) => {
    if (!normalizedGlobalQuery) {
      return true;
    }

    const searchableText = [
      order.student,
      order.id,
      order.items,
      order.status,
      order.dateTime,
      order.studentId,
      order.email,
      order.paymentMethod,
      order.total
    ]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedGlobalQuery);
  });

  const pendingOrders = orders.filter((order) => order.status === 'Pending');
  const preparingOrders = orders.filter((order) => order.status === 'Preparing');
  const readyOrders = orders.filter((order) => order.status === 'Ready');
  const completedOrders = orders.filter((order) => order.status === 'Completed');
  const activeOrders = orders.filter((order) => order.status !== 'Cancelled');
  const queueOrdersCount = pendingOrders.length + preparingOrders.length;
  const kitchenLoad = activeOrders.length > 0 ? Math.round((queueOrdersCount / activeOrders.length) * 100) : 0;

  const parseAmount = (price) => {
    const value = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    return Number.isNaN(value) ? 0 : value;
  };

  const completedRevenue = completedOrders.reduce((sum, order) => sum + parseAmount(order.total), 0);
  const queuedRevenue = pendingOrders
    .concat(preparingOrders)
    .reduce((sum, order) => sum + parseAmount(order.total), 0);
  const formattedCompletedRevenue = `₱${completedRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedQueuedRevenue = `₱${queuedRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const filteredOrders =
    selectedStatus === 'All Orders'
      ? searchFilteredOrders
      : searchFilteredOrders.filter((order) => order.status === selectedStatus);
  
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

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // Update selectedOrder if it's the one being changed
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-secondary-container text-on-secondary-container';
      case 'Preparing':
        return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 'Ready':
        return 'bg-tertiary-container text-on-tertiary-container';
      case 'Completed':
        return 'bg-primary-container text-on-primary-container';
      case 'Cancelled':
        return 'bg-error-container text-on-error-container';
      default:
        return 'bg-surface-container-high text-on-surface-variant';
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Page Header Section */}
      <div className="mb-10">
        <h2 className="text-4xl font-headline font-extrabold text-on-surface mb-6 tracking-tight">Order Management</h2>
        
        {/* Status Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedStatus('All Orders')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStatus === 'All Orders'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-container'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setSelectedStatus('Pending')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStatus === 'Pending'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-container'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedStatus('Preparing')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStatus === 'Preparing'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-container'
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => setSelectedStatus('Ready')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStatus === 'Ready'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-container'
            }`}
          >
            Ready
          </button>
          <button
            onClick={() => setSelectedStatus('Completed')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStatus === 'Completed'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-container'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setSelectedStatus('Cancelled')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedStatus === 'Cancelled'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-container'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/10">
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Student Name</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Items Ordered</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Total Price</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Date/Time</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-headline font-bold text-sm text-secondary uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-transparent">
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-container-low transition-colors duration-200">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <img className="w-8 h-8 rounded-full" src={order.image} alt="Student" />
                    <span className="font-medium text-on-surface">{order.student}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-sm text-secondary font-mono">{order.id}</td>
                <td className="px-6 py-6 text-sm text-on-surface-variant">{order.items}</td>
                <td className="px-6 py-6 text-sm font-bold text-primary">{order.total}</td>
                <td className="px-6 py-6 text-sm text-secondary">{order.dateTime}</td>
                <td className="px-6 py-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-6 text-right">
                  <button 
                    onClick={() => handleViewDetails(order)}
                    className="text-primary hover:text-primary-container font-semibold text-sm"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination / Footer */}
        <div className="px-6 py-4 bg-surface-container border-t border-outline-variant/10 flex items-center justify-between">
          <span className="text-sm text-on-surface-variant">
            Showing {startIndex + 1}-{Math.min(startIndex + ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition-all ${
                currentPage === 1 
                  ? 'text-zinc-300 cursor-not-allowed' 
                  : 'hover:bg-white text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                  currentPage === page
                    ? 'bg-primary text-on-primary'
                    : 'hover:bg-white text-on-surface'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition-all ${
                currentPage === totalPages 
                  ? 'text-zinc-300 cursor-not-allowed' 
                  : 'hover:bg-white text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Quick Actions (Floating Grid) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button
          onClick={() => setSelectedStatus('Pending')}
          className="bg-primary/5 p-6 rounded-xl border border-primary/10 flex flex-col gap-2 text-left transition-colors hover:bg-primary/10"
          type="button"
        >
          <span className="material-symbols-outlined text-primary text-3xl">pending_actions</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Queue Overview</h3>
          <p className="text-sm text-on-surface-variant">{queueOrdersCount} order{queueOrdersCount === 1 ? '' : 's'} are waiting for prep. Kitchen load is {kitchenLoad}%.</p>
        </button>
        <button
          onClick={() => setSelectedStatus('Ready')}
          className="bg-tertiary-fixed/20 p-6 rounded-xl border border-tertiary-fixed/30 flex flex-col gap-2 text-left transition-colors hover:bg-tertiary-fixed/30"
          type="button"
        >
          <span className="material-symbols-outlined text-tertiary text-3xl">notifications_active</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Ready Alerts</h3>
          <p className="text-sm text-on-surface-variant">{readyOrders.length} order{readyOrders.length === 1 ? '' : 's'} marked as Ready are awaiting pickup.</p>
        </button>
        <button
          onClick={() => setSelectedStatus('All Orders')}
          className="bg-secondary-container p-6 rounded-xl flex flex-col gap-2 text-left transition-colors hover:brightness-95"
          type="button"
        >
          <span className="material-symbols-outlined text-secondary text-3xl">analytics</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Daily Summary</h3>
          <p className="text-sm text-on-surface-variant">Completed revenue: {formattedCompletedRevenue} from {completedOrders.length} completed order{completedOrders.length === 1 ? '' : 's'}.</p>
          <p className="text-xs text-on-surface-variant/80">Queued potential: {formattedQueuedRevenue}</p>
        </button>
      </div>
      
      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-xl flex items-center justify-center active:scale-90 transition-transform z-50">
        <span className="material-symbols-outlined">print</span>
      </button>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-surface-container p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black font-headline text-on-surface">Order Details</h3>
                <p className="text-sm text-secondary">Order {selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-on-surface hover:text-primary transition-colors p-1"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Student Information */}
              <div className="bg-surface-container-low rounded-xl p-4">
                <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Student Information
                </h4>
                <div className="flex items-center gap-4 mb-3">
                  <img className="w-12 h-12 rounded-full" src={selectedOrder.image} alt="Student" />
                  <div>
                    <p className="font-semibold text-on-surface">{selectedOrder.student}</p>
                    <p className="text-sm text-secondary">{selectedOrder.studentId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-secondary">Email:</span>
                    <p className="text-on-surface">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <span className="text-secondary">Phone:</span>
                    <p className="text-on-surface">{selectedOrder.phone}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-surface-container-low rounded-xl p-4">
                <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-surface-container last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-on-surface">{item.name}</span>
                        <span className="text-xs text-secondary">×{item.quantity}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{item.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t border-surface-container">
                    <span className="font-bold text-on-surface">Total</span>
                    <span className="font-bold text-primary text-lg">{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-surface-container-low rounded-xl p-4">
                <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  Order Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary">Order Date/Time:</span>
                    <p className="text-on-surface">{selectedOrder.dateTime}</p>
                  </div>
                  <div>
                    <span className="text-secondary">Payment Method:</span>
                    <p className="text-on-surface">{selectedOrder.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-secondary">Status:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className={`mt-1 block w-full px-3 py-2 border border-outline-variant rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-sm font-bold ${getStatusStyle(selectedOrder.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-secondary">Special Instructions:</span>
                    <p className="text-on-surface">{selectedOrder.specialInstructions || 'None'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-surface-container-high text-on-secondary-container rounded-lg font-semibold hover:bg-surface-container transition-all"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-lg font-semibold shadow-md hover:brightness-110 transition-all">
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
